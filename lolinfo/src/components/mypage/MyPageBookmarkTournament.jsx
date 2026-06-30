import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import "./Bookmark.css";

export default function MyPageBookmarkTournament() {
    // 상태 관리
    
    const loginId = useAtomValue(loginIdState);
    const [bookmarkTournamentList, setBookmarkTournamentList] = useState ([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBookmarkTournamentList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get("/bookmark/tournament");
            setBookmarkTournamentList(data);
            console.log(data);
        } catch (error) {
            console.error(error);
            setError("즐겨찾기 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookmarkTournamentList();
    }, [loadBookmarkTournamentList]);


    //승률별 색상적용
    const getWinRateColor = (rate) => {
        if (rate >= 70) return "#3bc9db";
        if (rate >= 60) return "#4dabf7";
        if (rate >= 55) return "#69db7c";
        if (rate >= 50) return "#adb5bd";
        if (rate >= 45) return "#fcc419";
        if (rate >= 40) return "#ff922b";
        return "#ff6b6b";
    };
    function formatDate(value) {
        const d = new Date(value);
        const yy = String(d.getFullYear()).slice(2);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yy}년 ${mm}월${dd}일`;
    }

    return (
    <>
    <div className="container my-4">
    <h3 className="mb-4">즐겨찾기한 대회</h3>
        {loading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-light" role="status" />
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && bookmarkTournamentList.length === 0 && (
            <div className="card bg-dark border-secondary text-white p-4 text-center">
              등록된 즐겨찾기가 없습니다.
            </div>
          )}

          {!loading && !error && bookmarkTournamentList.length > 0 && (
            <div className="row g-2">
            {bookmarkTournamentList.map((tournament) => (
                 <Link
                    to={`/tournament/${tournament.tournamentId}`}
                    key={tournament.tournamentId}
                    className="card tournament-card mb-1"
                    >
                    <div className="row g-0 tournament-row">
                        {/* 연도 */}
                        <div className="col-md-2 col-3 year-tag">{tournament.tournamentYear}</div>

                        {/* 가운데 내용 */}
                        <div className="col-md-4 col-9">
                        <div className="card-body py-3">
                            <div className="tournament-top">
                            <span className={`tier-text badge ${tournament.tournamentTierType === "통합" ? "all-tier" : tournament.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier" }`}> {tournament.tournamentTierType}</span>
                            {/* 공식 대회 여부 : 배지 */}
                            {tournament.tournamentIsofficial === "Y" && (
                                <span className="badge official-badge ms-2">공식</span>
                            )}
                            {tournament.tournamentName?.includes("멸망전") && (
                                <span className="badge official-badge2 ms-2">멸망전</span>
                            )}
                            </div>
                            {/* 대회명 */}
                            <h5 className="tournament-title mt-2">
                            {tournament.tournamentName}
                            </h5>
                            {/* 기간 */}
                            {tournament.tournamentStart && (
                            <span className="period-text">
                            {formatDate(tournament.tournamentStart)} ~ {formatDate(tournament.tournamentEnd)}
                            </span>
                        )}
                        </div>
                        </div>
                        <div className="col-md-6 col-12 period-box ">
                        <div className="period-box-header team-badge">
                            <div className="col">
                            <span className="text-light fs-5">{tournament.teamName}</span>
                            </div>
                        </div>
                        <div className="period-box-body">
                            <div className="player">
                            <img className="player-profile"src={buildProfileUrl(tournament.topId)} alt={tournament.topName}/>
                            <br/><span className="player-name">{tournament.topName}</span>
                            </div>
                            <div className="player">
                            <img className="player-profile"src={buildProfileUrl(tournament.jugId)} alt={tournament.jugName}/>
                            <br/><span className="player-name">{tournament.jugName}</span>
                            </div>
                            <div className="player">
                            <img className="player-profile"src={buildProfileUrl(tournament.midId)} alt={tournament.midName}/>
                            <br/><span className="player-name">{tournament.midName}</span>
                            </div>
                            <div className="player">
                            <img className="player-profile"src={buildProfileUrl(tournament.adId)} alt={tournament.adName}/>
                            <br/><span className="player-name">{tournament.adName}</span>
                            </div>
                            <div className="player">
                            <img className="player-profile"src={buildProfileUrl(tournament.supId)} alt={tournament.supName}/>
                            <br/><span className="player-name">{tournament.supName}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </Link>
            ))}
            </div>
          )}
    </div>
    </>
  );
}