import axios from "../../utils/axios";
import { useCallback, useEffect, useState } from "react";
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

export default function TournamentDetail() {
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const loginId = useAtomValue(loginIdState);

  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState({});
  const [hostList, setHostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedTournamentId, setLoadedTournamentId] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const loadData = useCallback(async (signal) => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/tournament/${tournamentId}`, { signal });
      if (signal.aborted) return;
      if (!data?.tournamentName) {
        setError("대회 정보를 찾을 수 없습니다.");
        return;
      }
      setTournament(data);
    } catch (err) {
      if (signal.aborted) return;
      console.error("대회 정보 조회 실패", err);
      setError("대회 정보를 불러오지 못했습니다.");
    } finally {
      if (!signal.aborted) {
        setLoadedTournamentId(tournamentId);
        setLoading(false);
      }
    }
  }, [tournamentId]);

  const loadHostData = useCallback(async (signal) => {
    if (!tournamentId) return;

    try {
      const { data } = await axios.get(`/host/tournament/${tournamentId}`, { signal });
      if (signal?.aborted) return;
      setHostList(data);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("개최자 로딩 실패", err);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;

    const controller = new AbortController();
    setHostList([]);
    loadData(controller.signal);
    loadHostData(controller.signal);
    return () => controller.abort();
  }, [loadData, loadHostData, tournamentId]);

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
      setBookmarked(data);
    } catch (err) {
      console.error(err);
    }
  };


  const hasTierBoard = tournament?.tournamentName?.includes("멸망전");

  if (loading || loadedTournamentId !== tournamentId) {
    return (
      <>
        <Helmet>
          <title>SOOP LoL 대회 정보 | SOOPLOL</title>
          <meta name="description" content="SOOP LoL 스트리머 대회의 일정, 참가 정보, 주최자 및 관련 기록을 확인하세요." />
        </Helmet>
        <section className="tournament-detail-wrapper">
          <h1 className="text-center page-title tournament-detail-title">SOOP LoL 대회 정보</h1>
          <p className="text-center tournament-detail-description">
            SOOPLOL에서 스트리머 대회의 일정, 참가 정보, 주최자 및 관련 기록을 확인할 수 있습니다.
          </p>
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">대회 정보를 불러오는 중입니다.</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>SOOP LoL 대회 정보 | SOOPLOL</title>
          <meta name="description" content="SOOP LoL 스트리머 대회의 일정과 참가 정보를 확인하세요." />
        </Helmet>
        <section className="tournament-detail-wrapper">
          <h1 className="text-center page-title tournament-detail-title">SOOP LoL 대회 정보</h1>
          <p className="text-center tournament-detail-description">
            SOOPLOL은 SOOP에서 진행되는 LoL 스트리머 대회의 일정과 참가 기록을 제공합니다.
          </p>
          <p className="text-danger text-center" role="alert">{error}</p>
        </section>
      </>
    );
  }

  const tournamentName = tournament.tournamentName;
  const tournamentDescription = [
    `${tournamentName}의 SOOP LoL 대회 정보입니다.`,
    tournament.tournamentStart && `시작일은 ${tournament.tournamentStart}입니다.`,
    tournament.tournamentTierType && `티어 구분은 ${tournament.tournamentTierType}입니다.`,
    "주최자, 일정, 참가 및 관련 기록을 확인할 수 있습니다.",
  ].filter(Boolean).join(" ");

  return (
    <>
      <Helmet>
        <title>{`${tournamentName} 일정·참가 정보 | SOOPLOL`}</title>
        <meta name="description" content={tournamentDescription} />
      </Helmet>
      <h1 className="text-center page-title tournament-detail-title">{tournamentName}</h1>
      <p className="text-center tournament-detail-description">{tournamentDescription}</p>

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
            <div className="ms-2 stat-box text-center">
              <span className={`ms-2 stat-box-number ${tournament.tournamentIsofficial !== "Y" && "text-secondary"}`}>공식</span>
              <span className={`ms-4 stat-box-number ${tournament.tournamentIsofficial !== "N" && "text-secondary"}`}>스트리머개최</span>
              <hr />
              <span className={`ms-2 stat-box-number ${tournament.tournamentTierType !== "천상계" && "text-secondary"}`}>천상계</span>
              <span className={`ms-4 stat-box-number ${tournament.tournamentTierType !== "지상계" && "text-secondary"}`}>지상계</span>
              <span className={`ms-4 stat-box-number ${tournament.tournamentTierType !== "통합" && "text-secondary"}`}>통합</span>
              <hr />
              <h6 className="ms-4 stat-box-label">시작일 | {tournament.tournamentStart}</h6>
              <h6 className="ms-4 stat-box-label">종료일 | {tournament.tournamentEnd}</h6>
            </div>
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
