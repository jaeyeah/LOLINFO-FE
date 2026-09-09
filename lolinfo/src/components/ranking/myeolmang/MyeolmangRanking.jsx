import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../utils/axios";
import { buildProfileUrl } from "../../../utils/profileUrl";

const LIMIT = 20;
const PERIODS = [["all", "역대"], ["recent", "최근 3년"]];

export default function MyeolmangRanking() {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState({ all: null, recent: null });
  const [errors, setErrors] = useState({ all: false, recent: false });
  const rows = data[period];
  const error = errors[period];
  const loading = rows === null && !error;

  useEffect(() => {
    if (rows !== null) return;
    const controller = new AbortController();
    const fetchRanking = async () => {
      setErrors((prev) => ({ ...prev, [period]: false }));
      try {
        const response = await axios.get("/rank/myeolmang/result", {
          params: { period, limit: LIMIT },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data)) throw new Error("잘못된 랭킹 응답 형식");
        setData((prev) => ({ ...prev, [period]: response.data }));
      } catch {
        if (!controller.signal.aborted) setErrors((prev) => ({ ...prev, [period]: true }));
      }
    };
    fetchRanking();
    return () => controller.abort();
  }, [period, rows]);

  return (
    <section className="myeolmang-ranking-page card bg-dark border-secondary text-white shadow-sm" aria-busy={loading}>
      <div className="card-body">
        <header className="myeolmang-ranking-heading">
          <h2 className="h4 mb-2">멸망전 랭킹</h2>
          <p className="small text-white-50 mb-3">SOOP LOL 멸망전 우승 · 준우승 · 4강 기록을 기준으로 집계한 랭킹입니다.</p>
          <div className="myeolmang-ranking-filters">
            <div className="btn-group" role="group" aria-label="멸망전 랭킹 기간">
              {PERIODS.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={period === value}
                  className={`btn btn-sm ${period === value ? "btn-light" : "btn-outline-secondary text-light"}`}
                  onClick={() => {
                    if (period === value) return;
                    setErrors((prev) => ({ ...prev, [value]: false }));
                    setPeriod(value);
                  }}>{label}</button>
              ))}
            </div>
            <p className="small text-white-50 mb-0">{period === "all" ? "역대" : "최근 3년"} 멸망전 입상 기록</p>
          </div>
        </header>

        {loading ? (
          <div className="d-flex justify-content-center py-4" role="status">
            <div className="spinner-border text-light" /><span className="visually-hidden">멸망전 랭킹 불러오는 중</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 mb-0" role="alert">멸망전 랭킹 정보를 불러오지 못했습니다.</div>
        ) : rows.length === 0 ? (
          <p className="text-center text-secondary py-4 mb-0">멸망전 랭킹 데이터가 없습니다.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {rows.map((row) => (
              <div key={row.streamerNo} className="myeolmang-ranking-row border border-secondary rounded">
                <span className={`myeolmang-ranking-rank ${[1, 2, 3].includes(row.rank) ? `myeolmang-ranking-rank-${row.rank}` : ""}`}>
                  {row.rank}<span className="visually-hidden">위</span>
                </span>
                <Link to={`/streamer/${row.streamerNo}`} className="myeolmang-ranking-profile text-white text-decoration-none">
                  <img src={buildProfileUrl(row.streamerSoopId)} alt="" className="rounded-circle border border-secondary" />
                  <span className="fw-semibold">{row.streamerName || "-"}</span>
                </Link>
                <div className="myeolmang-ranking-records">
                  <span className={`myeolmang-medal myeolmang-medal-gold ${row.championCount === 0 ? "is-zero" : ""}`}>
                    <span className="medal-label">우승</span>
                    <span className="medal-count">{row.championCount}</span>
                  </span>
                  <span className={`myeolmang-medal myeolmang-medal-silver ${row.runnerUpCount === 0 ? "is-zero" : ""}`}>
                    <span className="medal-label">준우승</span>
                    <span className="medal-count">{row.runnerUpCount}</span>
                  </span>
                  <span className={`myeolmang-medal myeolmang-medal-bronze ${row.semifinalCount === 0 ? "is-zero" : ""}`}>
                    <span className="medal-label">4강</span>
                    <span className="medal-count">{row.semifinalCount}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
