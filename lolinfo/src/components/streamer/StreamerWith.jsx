import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";




export default function StreamerWith(){
    const { streamer, streamerId } = useOutletContext();

    //로딩중 설정
    const [withCk, setWithCk] = useState([]);
    const [withTournament, setWithTournament] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ckError, setCkError] = useState(null);
    const [tournamentError, setTournamentError] = useState(null);

    const loadCkData = useCallback(async()=>{
        try {
            setLoading(true);
            setCkError(null);
            const { data } = await axios.get("/streamer/withCk", {
                params: { streamerId }
            });
            setWithCk(data);
            console.log("CK 데이터 : ",data)
            } catch (error) {
            console.error("Error fetching streamer detail:", error);
            setCkError("스트리머 CK정보를 불러오지 못했습니다.");
            }
            finally {
            setLoading(false);
        }
    }, [streamerId]);

    const loadTournamentData = useCallback(async()=>{
        try {
            setLoading(true);
            setTournamentError(null);
            const { data } = await axios.get("/streamer/withTournament", {
                params: { streamerId }
            });
            setWithTournament(data);
            console.log("CK 데이터 : ",data)
        } catch (error) {
            console.error("Error fetching streamer detail:", error);
            setTournamentError("스트리머 대회정보를 불러오지 못했습니다.");
        }
            finally {
            setLoading(false);
        }
    }, [streamerId]);



    useEffect(()=>{
        loadCkData();
        loadTournamentData();
    },[]);

    const getWinRateColor = (rate) => {
        if (rate >= 70) return "#2ecc71";
        if (rate >= 55) return "#4dabf7";
        if (rate >= 45) return "#f6c23e";
        return "#e74c3c";
    };


return (<>
<div className="mt-3 row">
    {/* 같이 CK 참여했던 스트리머 목록 */}
    <div className="col-12 col-xl-6">
        <div className="card bg-dark border-secondary h-100">
        <div className="card-header bg-white border-secondary d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold section-title">같은 CK팀 스트리머 전적</h5>
        </div>
        <div className="card-body">
            {loading && (
            <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-light" role="status" />
            </div>
            )}

            {ckError && (
            <div className="alert alert-danger" role="alert">
                {ckError}
            </div>
            )}

            {!loading && !ckError && (
            <div className="list-group list-group-flush">
                {withCk.map((withCk) => (
                <div key={withCk.partnerNo} className="list-group-item bg-dark border-secondary text-white py-3 vs-item">
                    <div className="d-flex justify-content-between align-items-center gap-3">
                    <div className="min-w-0">
                        <div className="fw-semibold text-truncate vs-item-name">
                        <Link to={`/streamer/${withCk.partnerNo}`} className="fs-6 text-decoration-none text-white">
                            <img src={buildProfileUrl(withCk.partnerSoopId)}
                                className="ck-participant-avatar" alt={withCk.partnerName || ""}/>
                            <span className="ms-2">{withCk.partnerName}</span>
                        </Link>
                            <span className="ms-3 text-secondary vs-item-record mt-1">
                            : {withCk.playCount}전 {withCk.winCount}승 {withCk.loseCount}패
                            </span>
                        </div>
                    </div>
                    <div className="text-end">
                        <span className="fw-semibold mb-2 vs-item-rate me-3 fs-5">{withCk.winRate}%</span>
                    </div>
                    </div>
                    {/* VS 게이지바 */}
                    <div className="vs-item-bar bg-white bg-opacity-10 rounded-pill mt-3">
                    <div className="vs-item-bar-fill rounded-pill"
                        style={{  width: `${withCk.winRate}%`,  backgroundColor: getWinRateColor(withCk.winRate),
                        }}/>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    </div>

    {/* 같이 대회 참여했던 스트리머 목록 */}
    <div className="col-12 col-xl-6">
        <div className="card bg-dark border-secondary h-100">
        <div className="card-header bg-white border-secondary d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold section-title">같은 대회팀 스트리머 전적</h5>
        </div>
        <div className="card-body">
            {loading && (
            <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-light" role="status" />
            </div>
            )}

            {tournamentError && (
            <div className="alert alert-danger" role="alert">
                {tournamentError}
            </div>
            )}

            {!loading && !tournamentError && (
            <div className="list-group list-group-flush">
                {withTournament.map((withTournament) => (
                <div key={withTournament.partnerNo} className="list-group-item bg-dark border-secondary text-white py-3 vs-item">
                    <div className="d-flex justify-content-between align-items-center gap-3">
                        <div className="min-w-0">
                            <div className="fw-semibold text-truncate vs-item-name">
                            <Link to={`/streamer/${withTournament.partnerNo}`} className="fs-6 text-decoration-none text-white">
                                <img src={buildProfileUrl(withTournament.partnerSoopId)}
                                    className="ck-participant-avatar" alt={withTournament.partnerName || ""}/>
                                <span className="ms-2 me-2">{withTournament.partnerName}</span>
                            </Link>
                                <span className="text-secondary">with</span>
                                <span className="ms-1 fw-semibold mb-2 vs-item-rate me-3 fs-5">{withTournament.playCount}회</span>
                                {withTournament.withOfficial === 'Y' && (
                                    <span className="badge official-badge2 ms-2">멸망전</span>
                                )}
                                {withTournament.withChampion === 'Y' && (
                                    <span className="badge official-badge ms-2">우승</span>
                                )}
                                {withTournament.withFinal === 'Y' && (
                                    <span className="badge bg-secondary ms-2">준우승</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-end">
                            <button className="btn btn-positive bg-secondary text-white" disabled>상세보기</button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    </div>

</div>
</>)
}