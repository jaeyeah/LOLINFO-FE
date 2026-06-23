import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../../utils/profileUrl";
import Pagination from "../../Pagination";

export default function WithCk({ streamerId, keyword }) {
  const [withCk, setWithCk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ckError, setCkError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });

  const loadCkData = useCallback(async () => {
    try {
      setLoading(true);
      setCkError(null);

      const { data } = await axios.get("/streamer/withCk", {
        params: { streamerId, page,
            ...(keyword && { keyword }), },
      });

      setWithCk(data.list);
      setPageData(data.pageVO);
      console.log("ck 정보 : ",data);
    } catch (error) {
      console.error(error);
      setCkError("스트리머 CK정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [streamerId, page, keyword]);

  useEffect(() => {
    if (streamerId) loadCkData();
  }, [streamerId, loadCkData, page]);

  useEffect(() => {
    setPage(1);
    }, [keyword]);

  const getWinRateColor = (rate) => {
    if (rate >= 100) return "#39dd46";
    if (rate >= 70) return "#38cc76";
    if (rate >= 60) return "#1b95fa";
    if (rate >= 55) return "#abd9ff";
    if (rate >= 50) return "#bdbcbc";
    if (rate >= 45) return "#b3aa91";
    if (rate >= 40) return "#f8b200";
    if (rate >= 35) return "#e7893c";
    if (rate >= 30) return "#e75e3c";
    return "#e74c3c";
  };

  return (
    <div className="col-12 col-xl-6 mb-3">
        <div className="card bg-dark border-secondary h-100">
        <div className="card-header bg-white border-secondary d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold section-title">CK 팀메이트 승률</h5>
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
                {withCk.map((withCk) => (
                <div key={withCk.partnerNo} className="list-group-item bg-dark border-secondary text-white py-3 vs-item">
                    <div className="d-flex justify-content-between align-items-center gap-3">
                    <div className="min-w-0">
                        <div className="fw-semibold text-truncate vs-item-name">
                        <Link to={`/streamer/${withCk.partnerNo}`} className="fs-6 text-decoration-none text-white">
                            <img src={buildProfileUrl(withCk.partnerSoopId)} loading="lazy"
                                className="ck-participant-avatar" alt={withCk.partnerName || ""}/>
                            <span className="ms-2 fs-5">{withCk.partnerName}</span>
                        </Link>
                            <span className="ms-3 text-secondary">with</span>
                            <span className="ms-2  vs-item-record mt-1">
                                {withCk.playCount}전 {withCk.winCount}승 {withCk.loseCount}패
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
  );
}