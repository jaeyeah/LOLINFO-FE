import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../../utils/profileUrl";
import Pagination from "../../Pagination";

export default function WithTournament({ streamerId, keyword }) {
  const [withTournament, setWithTournament] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentError, setTournamentError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });

  const [openPartnerNo, setOpenPartnerNo] = useState(null);
  const [detailMap, setDetailMap] = useState({});

  const loadTournamentData = useCallback(async () => {
    try {
      setLoading(true);
      setTournamentError(null);

      const { data } = await axios.get("/streamer/withTournament", {
        params: { streamerId, page, 
            ...(keyword && { keyword }),
        },
      });

      setWithTournament(data.list);
      setPageData(data.pageVO);
      console.log("대회 정보 : ",data);
    } catch (error) {
      console.error(error);
      setTournamentError("스트리머 대회정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [streamerId, page, keyword]);

  useEffect(() => {
    if (streamerId) loadTournamentData();
  }, [streamerId, loadTournamentData, page]);

    useEffect(() => {
        setPage(1);
        }, [keyword]);


  const toggleDetail = async (partnerNo) => {
    if (openPartnerNo === partnerNo) {
      setOpenPartnerNo(null);
      return;
    }

    setOpenPartnerNo(partnerNo);

    if (detailMap[partnerNo]) return;

    const { data } = await axios.get(`/streamer/withTournament/${partnerNo}`, {
      params: { streamerId },
    });

    setDetailMap((prev) => ({
      ...prev,
      [partnerNo]: data,
    }));
  };

  return (
    <div className="col-12 col-xl-6 mb-3">
        <div className="card bg-dark border-secondary h-100">
        <div className="card-header bg-white border-secondary d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold section-title">대회 팀메이트</h5>
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
                <div className ="row mt-3">
                    <div className="col-12 d-flex justify-content-center">
                        <Pagination
                            page={page}
                            totalPage={pageData.totalPage}
                            blockStart={pageData.blockStart}
                            blockFinish={pageData.blockFinish}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
                {withTournament.map((withTournament) => (
                <div key={withTournament.partnerNo} className="list-group-item bg-dark border-secondary text-white py-3 vs-item">
                    {/* <div className="d-flex justify-content-between align-items-center gap-3"> */}
                    <div className="row align-items-center g-2">
                        <div className="col-sm col-12">
                            <div className="fw-semibold text-truncate vs-item-name">
                            <Link to={`/streamer/${withTournament.partnerNo}`} className="fs-6 text-decoration-none text-white">
                                <img src={buildProfileUrl(withTournament.partnerSoopId)} loading="lazy"
                                    className="ck-participant-avatar" alt={withTournament.partnerName || ""}/>
                                <span className="ms-2 me-2 fs-5">{withTournament.partnerName}</span>
                            </Link>
                                <span className="text-secondary">with</span>
                                <span className="ms-1 fw-semibold mb-2 vs-item-rate me-3 fs-5">{withTournament.playCount}회</span>
                                {withTournament.withOfficial === 'Y' && (
                                    <span className="badge official-badge2 ms-2">멸망전</span>
                                )}
                                {withTournament.withChampion === 'Y' && (
                                    <span className="badge bg-warning text-dark ms-2">우승</span>
                                )}
                                {withTournament.withFinal === 'Y' && (
                                    <span className="badge bg-secondary ms-2">준우승</span>
                                )}
                            </div>
                        </div>
                        {/* 상세버튼 - PC용 */}
                        <div className="col-sm-auto d-none d-sm-block text-end">
                            <button className="btn btn-sm btn-outline-secondary"
                                onClick={() => toggleDetail(withTournament.partnerNo)}
                            > 상세보기 </button>
                        </div>
                        {/* 상세버튼 - 모바일용 */}
                        <div className="col-12 d-sm-none text-end">
                            <button className="btn btn-outline-secondary w-100"
                                onClick={() => toggleDetail(withTournament.partnerNo)}
                            > 상세보기 </button>
                        </div>

                        {/* 팀메이트 상세 토글 */}
                        {openPartnerNo === withTournament.partnerNo && (
                            <div className="mt-3 pt-3 border-top border-bottom border-secondary with-detail-box">
                                {(detailMap[withTournament.partnerNo] || []).map(team => (
                                    <div key={team.teamNo} className="row d-flex justify-content-between mb-2">
                                        <Link className="col-3" to={`/tournament/${team.tournamentId}`}>
                                            <span className="badge text-secondary">- {team.tournamentYear} || {team.tournamentName} </span>
                                        </Link>
                                        <span className="col-7 fw-semibold">{team.teamName}</span>
                                        <div className="col-2 text-center">
                                            <span className={`badge ${team.teamRanking === '우승' ? "bg-warning text-dark"
                                                : team.teamRanking === "준우승" ? "bg-secondary"
                                                : team.teamRanking === "4강" ? "text-light"
                                                : team.teamRanking === "예선탈락" ? "text-danger"
                                                : "badge text-secondary"
                                                }`}
                                            >{team.teamRanking}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                ))}
            </div>
            )}
            
        </div>
        </div>
    </div>
  );
}