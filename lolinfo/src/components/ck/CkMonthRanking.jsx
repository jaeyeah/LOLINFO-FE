import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";

export default function CkMonthRanking() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthValue = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthValue}`;
  });
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!month) return;

      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/ck/rank/${month}`);
        setRanking(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("CK 월간 랭킹 조회 실패", err);
        setError("랭킹을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [month]);

  const formatWinRate = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "-";
    const percent = numeric > 1 ? numeric : numeric * 100;
    return `${percent.toFixed(1)}%`;
  };

  const rankingList = useMemo(() => ranking ?? [], [ranking]);

  const getWinRateColor = (rate) => {
    if (rate >= 100) return "#47acff";
    if (rate >= 80) return "#82c7ff";
    if (rate >= 60) return "#9efd91e8";
    if (rate >= 50) return "#bdbcbc";
    if (rate >= 45) return "#b3aa91";
    if (rate >= 40) return "#f8b200";
    return "#e74c3c";
  };


  return (
    <div className="card bg-dark border-secondary text-white shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-1 section-title">월간 다승 Top 10</h3>
            <input type="month" className="form-control bg-dark text-secondary border-secondary"
                style={{ width: "160px" }} value={month} onChange={(e) => setMonth(e.target.value)}/>
        </div>

        {loading && (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border text-light" role="status" />
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2 mb-0" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && rankingList.length === 0 && (
          <div className="text-center text-secondary py-4">해당 월의 랭킹 데이터가 없습니다.</div>
        )}

        {!loading && !error && rankingList.length > 0 && (
          <div className="d-flex flex-column gap-1">
            {rankingList.map((item, index) => {
              const streamerId = item.streamerNo ?? item.ckStreamer ?? "";
              const streamerName = item.streamerName || "-";
              const streamerSoopId = item.streamerSoopId || "";

              return (
                <div key={`${streamerId}-${index}`} className="border border-secondary rounded p-1 ps-3 pe-3 bg-black bg-opacity-10">
                  <div className="d-flex align-items-center gap-3">
                    <div className="fw-bold text-warning" style={{ width: 32 }}>
                      {index + 1}
                    </div>

                    <img src={buildProfileUrl(streamerSoopId)} alt={streamerName}
                      className="rounded-circle border border-secondary" style={{ width: 44, height: 44, objectFit: "cover" }}  />

                    <div className="flex-grow-1 min-width-0">
                      <Link to={`/streamer/${streamerId}`} className="fw-semibold text-white text-decoration-none">
                        {streamerName}
                      </Link>
                      <div className="small text-white-50">
                        <span className="me-2">{item.playCount ?? 0}전 |</span>
                        <span className="fw-semibold">{item.winCount ?? 0}승 · {item.loseCount ?? 0}패</span>
                      </div>
                    </div>
                    <div className="text-end" style={{ width: 80 }}>
                        <div className="fw-semibold small" style={{ color: getWinRateColor(item.winRate) }} >
                            {formatWinRate(item.winRate)}
                        </div>
                        <div className="progress bg-secondary bg-opacity-25 mt-1" style={{ height: "5px" }}>
                            <div className="progress-bar" role="progressbar"
                                style={{ width: `${item.winRate ?? 0}%`, backgroundColor: getWinRateColor(item.winRate), transition: "width 0.3s ease"}}/>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
