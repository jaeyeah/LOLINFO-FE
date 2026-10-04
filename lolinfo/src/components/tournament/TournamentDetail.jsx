import axios from "../../utils/axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { useAtomValue } from "jotai";
import { adminState, loginIdState, loginState } from "../../utils/jotai";
import "./Tournament.css";
import "./Scrim.css";
import Swal from "sweetalert2";
import { FaRegStar, FaStar } from "react-icons/fa6";
import FeedbackModal from "../etc/FeedbackModal";
import { Helmet } from "react-helmet-async";
import { isTierBoardAvailable } from "./tierBoardConfig";

export default function TournamentDetail() {
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const loginId = useAtomValue(loginIdState);

  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [detailState, setDetailState] = useState({ requestKey: null, status: "loading", tournament: null });
  const [hostList, setHostList] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hostControllerRef = useRef(null);
  const currentTournamentIdRef = useRef(tournamentId);
  currentTournamentIdRef.current = tournamentId;

  const numericTournamentId = /^\d+$/.test(tournamentId ?? "") ? Number(tournamentId) : NaN;
  const hasValidTournamentId = Number.isSafeInteger(numericTournamentId) && numericTournamentId > 0;
  const requestKey = `${tournamentId}:${retryCount}`;

  useEffect(() => {
    const controller = new AbortController();
    let hostController;

    setHostList([]);
    setBookmarked(false);
    setShowFeedback(false);

    if (!hasValidTournamentId) {
      setDetailState({ requestKey, status: "not-found", tournament: null });
      return () => controller.abort();
    }

    setDetailState({ requestKey, status: "loading", tournament: null });

    const loadTournament = async () => {
      try {
        const { data } = await axios.get(`/tournament/${tournamentId}`, { signal: controller.signal });

        if (data === null || data === undefined || data === "" || (data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 0)) {
          setDetailState({ requestKey, status: "not-found", tournament: null });
          return;
        }

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          Number(data.tournamentId) !== numericTournamentId ||
          typeof data.tournamentName !== "string" ||
          !data.tournamentName.trim()
        ) {
          setDetailState({ requestKey, status: "error", tournament: null });
          return;
        }

        setDetailState({ requestKey, status: "success", tournament: data });

        hostController = new AbortController();
        hostControllerRef.current = hostController;
        try {
          const { data: hosts } = await axios.get(`/host/tournament/${tournamentId}`, { signal: hostController.signal });
          if (!hostController.signal.aborted && currentTournamentIdRef.current === tournamentId) {
            if (Array.isArray(hosts)) {
              setHostList(hosts);
            } else {
              console.error("개최자 응답 형식 오류");
            }
          }
        } catch (err) {
          if (!hostController.signal.aborted) console.error("개최자 로딩 실패", err);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err.response?.status === 404) {
          setDetailState({ requestKey, status: "not-found", tournament: null });
        } else {
          console.error("대회 정보 조회 실패", err);
          setDetailState({ requestKey, status: "error", tournament: null });
        }
      }
    };

    loadTournament();
    return () => {
      controller.abort();
      hostController?.abort();
      hostControllerRef.current?.abort();
    };
  }, [hasValidTournamentId, numericTournamentId, retryCount, tournamentId]);

  const loadHostData = useCallback(async () => {
    if (!hasValidTournamentId || currentTournamentIdRef.current !== tournamentId) return;

    hostControllerRef.current?.abort();
    const controller = new AbortController();
    hostControllerRef.current = controller;
    try {
      const { data } = await axios.get(`/host/tournament/${tournamentId}`, { signal: controller.signal });
      if (!controller.signal.aborted && currentTournamentIdRef.current === tournamentId) {
        if (Array.isArray(data)) {
          setHostList(data);
        } else {
          console.error("개최자 응답 형식 오류");
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) console.error("개최자 로딩 실패", err);
    }
  }, [hasValidTournamentId, tournamentId]);

  const deleteHost = useCallback(async (hostStreamer, hostTournament) => {
    try {
      await axios.delete(`/host/`, {
        data: { hostStreamer, hostTournament },
      });
      await loadHostData();
    } catch (err) {
      console.error("개최자 삭제 실패", err);
    }
  }, [loadHostData]);

  const toggleBookmark = async () => {
    if (!isLogin) {
      const result = await Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "로그인 페이지로 이동하시겠습니까?",
        showCancelButton: true,
        confirmButtonText: "이동",
        cancelButtonText: "취소",
      });

      if (result.isConfirmed) {
        navigate("/member/login");
      }
      return;
    }

    try {
      const { data } = await axios.post("/bookmark/tournament", null, {
         params : {tournamentId : tournamentId}
      });
      if (currentTournamentIdRef.current === tournamentId) setBookmarked(data);
    } catch (err) {
      console.error(err);
    }
  };

  const isCurrentDetail = detailState.requestKey === requestKey;
  const status = !hasValidTournamentId
    ? "not-found"
    : isCurrentDetail
      ? detailState.status
      : "loading";
  const tournament = status === "success" ? detailState.tournament : null;
  const hasTierBoard = isTierBoardAvailable(tournamentId);

  const tournamentName = tournament?.tournamentName;
  const tournamentType = tournament?.tournamentIsofficial === "Y" ? "공식" : "스트리머 개최";
  const tournamentPeriod = tournament?.tournamentStart
    ? `${tournament.tournamentStart}${tournament.tournamentEnd ? `부터 ${tournament.tournamentEnd}까지` : ""}`
    : "";
  const pageTitle = tournamentName
    ? `${tournamentName} 대회 정보·참가팀·기록 | SOOPLOL`
    : "대회 정보 | SOOPLOL";
  const pageDescription = tournamentName
    ? `${tournamentName}의 ${tournamentType} 대회 정보${tournamentPeriod ? `, ${tournamentPeriod} 일정` : ""}, 참가팀과 경기 기록을 SOOPLOL에서 확인하세요.`
    : "SOOP LOL 대회의 일정, 참가팀과 경기 기록을 확인하세요.";

  if (status === "loading") {
    return (
      <>
        <Helmet>
          <title>대회 정보 불러오는 중 | SOOPLOL</title>
          <meta name="description" content="대회 정보를 불러오고 있습니다." />
        </Helmet>
        <h2 className="text-center page-title tournament-detail-title">대회 정보</h2>
        <div className="d-flex justify-content-center align-items-center gap-2 py-5" role="status">
          <div className="spinner-border" aria-hidden="true" />
          <span>대회 정보를 불러오는 중입니다.</span>
        </div>
      </>
    );
  }

  if (status === "not-found") {
    return (
      <>
        <Helmet>
          <title>대회를 찾을 수 없습니다 | SOOPLOL</title>
          <meta name="description" content="요청하신 대회가 존재하지 않거나 삭제되었습니다." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <section className="text-center py-5" role="status">
          <h2 className="page-title tournament-detail-title">대회를 찾을 수 없습니다</h2>
          <p>요청하신 대회가 존재하지 않거나 삭제되었습니다.</p>
          <Link to="/tournament" className="btn btn-outline-primary">대회 목록</Link>
        </section>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <Helmet>
          <title>대회 정보를 불러올 수 없습니다 | SOOPLOL</title>
          <meta name="description" content="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <section className="text-center py-5" role="alert">
          <h2 className="page-title tournament-detail-title">대회 정보를 불러올 수 없습니다</h2>
          <p>일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
          <div className="d-flex justify-content-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => setRetryCount((count) => count + 1)}>
              다시 시도
            </button>
            <Link to="/tournament" className="btn btn-outline-primary">대회 목록</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://sooplol.com/tournament/${tournamentId}`} />
      </Helmet>
      <h2 className="text-center page-title tournament-detail-title">{tournament.tournamentName} : 대회 상세</h2>

      <div className="row tournament-detail-navigation">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap">
            <NavLink to="" end className={({ isActive }) => (isActive ? "btn btn-primary" : "btn btn-outline-primary")}>
              정보
            </NavLink>
            {hasTierBoard && (
              <NavLink to="tier" className={({ isActive }) => (isActive ? "btn btn-primary" : "btn btn-outline-primary")}>
                티어표
              </NavLink>
            )}
          </div>
        </div>
      </div>

      <div className="streamer-card tournament-detail-card mb-2">
        <div className="row g-0">
          <div className="col-lg-4 col-12 position-relative">
            <div className="tournament-host-header">
              <h3 className="host-box text-center">주최</h3>
              <div className="tournament-host-actions">
                <button
                  type="button"
                  className={`btn tournament-bookmark-button ${bookmarked ? "btn-warning" : "btn-outline-warning"}`}
                  onClick={toggleBookmark}
                  aria-label={bookmarked ? "대회 북마크 해제" : "대회 북마크"}
                  title={bookmarked ? "대회 북마크 해제" : "대회 북마크"}
                >
                  {bookmarked ? <FaStar /> : <FaRegStar />}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light tournament-feedback-button"
                  onClick={() => setShowFeedback(true)}
                >
                  오류·누락 제보
                </button>
              </div>
            </div>
            <div className="d-flex tournment-host justify-content-center align-items-center gap-2">
              {hostList.map((host) => (
                <div className="text-center" key={host.hostStreamer}>
                  <Link to={`/streamer/${host.hostStreamer}`}>
                    <img className="host-profile mb-1" src={buildProfileUrl(host.streamerSoopId)} alt={host.streamerName} />
                  </Link>
                  <br />
                  <span className="stat-box-number">{host.streamerName}</span>
                  {isAdmin === true && (
                    <div className="p-1 ms-1 btn btn-danger pt-0 pb-0" onClick={() => deleteHost(host.hostStreamer, host.hostTournament)}>
                      X
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-8 col-12">
            <section className="tournament-summary-card" aria-label="대회 정보">
              <p className="tournament-summary-eyebrow">TOURNAMENT INFO</p>
              <h3>대회 정보</h3>
              <div className="tournament-summary-groups">
                <div className="tournament-summary-group">
                  <span className="tournament-summary-label">개최 유형</span>
                  <div className="tournament-summary-options">
                    <span className={`tournament-summary-chip ${tournament.tournamentIsofficial === "Y" ? "is-active" : ""}`}>공식</span>
                    <span className={`tournament-summary-chip ${tournament.tournamentIsofficial === "N" ? "is-active" : ""}`}>스트리머 개최</span>
                  </div>
                </div>
                <div className="tournament-summary-group">
                  <span className="tournament-summary-label">대회 구분</span>
                  <div className="tournament-summary-options">
                    <span className={`tournament-summary-chip ${tournament.tournamentTierType === "천상계" ? "is-active" : ""}`}>천상계</span>
                    <span className={`tournament-summary-chip ${tournament.tournamentTierType === "지상계" ? "is-active" : ""}`}>지상계</span>
                    <span className={`tournament-summary-chip ${tournament.tournamentTierType === "통합" ? "is-active" : ""}`}>통합</span>
                  </div>
                </div>
              </div>
              <div className="tournament-summary-period">
                <div>
                  <span>시작일</span>
                  <strong>{tournament.tournamentStart || "-"}</strong>
                </div>
                <div>
                  <span>종료일</span>
                  <strong>{tournament.tournamentEnd || "-"}</strong>
                </div>
              </div>
            </section>
          </div>
          </div>
        </div>

      <FeedbackModal
        show={showFeedback}
        onClose={() => setShowFeedback(false)}
        targetType="TOURNAMENT"
        targetId={tournamentId}
        targetName={tournament.tournamentName}
      />

      <Outlet context={{ tournament, tournamentId, isLogin, isAdmin, loginId }} />
    </>
  );
}
