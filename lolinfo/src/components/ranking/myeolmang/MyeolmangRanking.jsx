import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../utils/axios";
import { buildProfileUrl } from "../../../utils/profileUrl";

const POSITIONS = [
  ["ALL", "종합"], ["TOP", "TOP"], ["JUNGLE", "JUNGLE"],
  ["MID", "MID"], ["ADC", "ADC"], ["SUPPORT", "SUPPORT"],
];

export default function MyeolmangRanking() {
  const [position, setPosition] = useState("ALL");
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [retry, setRetry] = useState(0);
  const requests = useRef({});
  const rows = data[position];
  const error = errors[position];
  const loading = rows === undefined && !error;

  useEffect(() => {
    if (rows !== undefined) return;
    let active = true;
    // 빠른 탭 전환과 StrictMode에서도 같은 포지션의 진행 중 요청을 재사용한다.
    if (!requests.current[position]) {
      requests.current[position] = axios.get("/rank/myeolmang", {
        params: position === "ALL" ? {} : { position },
      }).then(({ data: result }) => {
        if (!Array.isArray(result)) throw new Error("잘못된 랭킹 응답 형식");
        return result;
      });
    }
    requests.current[position].then((result) => {
      if (active) setData((prev) => ({ ...prev, [position]: result }));
    }, () => {
      if (active) setErrors((prev) => ({ ...prev, [position]: true }));
    });
    // 이전 탭의 응답은 현재 탭을 덮어쓰지 않는다. 완료된 요청도 재진입 시 재사용한다.
    return () => { active = false; };
  }, [position, rows, retry]);

  return (
    <section className="myeolmang-ranking-page card bg-dark border-secondary text-white shadow-sm" aria-busy={loading}>
      <div className="card-body">
        <header className="myeolmang-ranking-heading">
          <h2 className="h4 mb-2">멸망전 랭킹</h2>
          <p className="small text-white-50 mb-3">SOOP LOL 멸망전 우승 · 준우승 · 4강 기록을 기준으로 집계한 랭킹입니다.</p>
          <p className="small text-white-50 mb-3">우승 → 준우승 → 4강 횟수 순이며, 모두 같으면 공동 순위입니다. 포지션별 성적은 해당 대회에서 실제 출전한 포지션을 기준으로 합니다.</p>
          <div className="myeolmang-ranking-tabs" role="group" aria-label="멸망전 랭킹 포지션">
            {POSITIONS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={position === value}
                className={`ck-ranking-page-type ${position === value ? "active" : ""}`}
                onClick={() => setPosition(value)}>{label}</button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="d-flex justify-content-center py-4" role="status">
            <div className="spinner-border text-light" /><span className="visually-hidden">멸망전 랭킹 불러오는 중</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 mb-0" role="alert">
            멸망전 랭킹 정보를 불러오지 못했습니다.
            <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => {
              delete requests.current[position];
              setErrors((prev) => ({ ...prev, [position]: false }));
              setRetry((prev) => prev + 1);
            }}>다시 시도</button>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-secondary py-4 mb-0">멸망전 랭킹 데이터가 없습니다.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {rows.map((row) => (
              <div key={row.streamerNo} className="myeolmang-ranking-row border border-secondary rounded">
                <span className={`myeolmang-ranking-rank ${[1, 2, 3].includes(row.ranking) ? `myeolmang-ranking-rank-${row.ranking}` : ""}`}>
                  {row.ranking}<span className="visually-hidden">위</span>
                </span>
                <Link to={`/streamer/${row.streamerNo}`} className="myeolmang-ranking-profile text-white text-decoration-none">
                  <img src={buildProfileUrl(row.streamerSoopId)} alt="" loading="lazy" className="rounded-circle border border-secondary"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      const fallback = buildProfileUrl(null);
                      if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                    }} />
                  <span className="fw-semibold">{row.streamerName || "-"}</span>
                </Link>
                <div className="myeolmang-ranking-records">
                  <span className={`myeolmang-medal myeolmang-medal-gold ${row.winCount === 0 ? "is-zero" : ""}`}>
                    <span className="medal-label">우승</span>
                    <span className="medal-count">{row.winCount}</span>
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
