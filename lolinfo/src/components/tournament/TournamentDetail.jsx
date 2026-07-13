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
  const [bookmarked, setBookmarked] = useState(false);

  const loadData = useCallback(async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/tournament/${tournamentId}`);
      setTournament(data);
    } catch (err) {
      console.error("대회 정보 조회 실패", err);
      setError("대회 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  const loadHostData = useCallback(async () => {
    if (!tournamentId) return;

    try {
      const { data } = await axios.get(`/host/tournament/${tournamentId}`);
      setHostList(data);
    } catch (err) {
      console.error("개최자 로딩 실패", err);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;

    loadData();
    loadHostData();
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

  return (
    <>
      <h2 className="text-center page-title p-3">{tournament.tournamentName} : 대회 상세</h2>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      )}

      <div className="row mt-3">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap mb-3">
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

      {error && <p className="text-danger">{error}</p>}

      <div className="streamer-card mb-2">
        <div className="row g-0">
          <div className="col-lg-4 col-12 position-relative">
            <h3 className="host-box text-center">주최</h3>
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
              <button type="button" className={`btn position-absolute top-0 end-0 mt-5 ${bookmarked ? "btn-warning" : "btn-outline-warning"}`} onClick={toggleBookmark}>
                {bookmarked ? <FaStar /> : <FaRegStar />}
              </button>
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

      <Outlet context={{ tournament, tournamentId, isLogin, isAdmin, loginId }} />
    </>
  );
}
