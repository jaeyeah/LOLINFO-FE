import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../../utils/axios";
import { getKoreaToday } from "../../utils/ckPeriod";
import { buildProfileUrl } from "../../utils/profileUrl";
import StreamerMonthlyCharts from "./StreamerMonthlyCharts";
import { formatRate, formatChange } from "./streamerStatFormat";
import "./StreamerMonthlyStats.css";

export default function StreamerMonthlyStats() {
    const [params, setParams] = useSearchParams();
    const streamerNo = params.get("streamerNo");
    const year = params.get("year") ?? getKoreaToday().slice(0, 4);
    const [keyword, setKeyword] = useState("");
    const [search, setSearch] = useState({ items: [], status: "idle" });
    const [state, setState] = useState({ key: "", data: null, status: "idle" });
    const [retry, setRetry] = useState(0);
    const requestKey = `${streamerNo}:${year}:${retry}`;
    const updateParams = (values) => {
        const next = new URLSearchParams(params);
        next.set("tab", "streamer");
        Object.entries(values).forEach(([key, value]) => next.set(key, value));
        setParams(next);
    };
    useEffect(() => {
        if (!keyword.trim()) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setSearch({ items: [], status: "loading" });
            try {
                const { data } = await axios.get("/streamer/autoSearch", {
                    params: { keyword: keyword.trim() }, signal: controller.signal,
                });
                if (!controller.signal.aborted) setSearch({ items: data, status: "ready" });
            } catch {
                if (!controller.signal.aborted) setSearch({ items: [], status: "error" });
            }
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [keyword]);
    useEffect(() => {
        if (!streamerNo || !/^\d+$/.test(streamerNo) || Number(streamerNo) < 1 ||
            !/^\d+$/.test(year) || Number(year) < 1 || Number(year) > 9998) return;
        const controller = new AbortController();
        axios.get(`/stats/streamer/${streamerNo}/monthly`, {
            params: { year: Number(year) }, signal: controller.signal,
        }).then(({ data }) => {
            if (!controller.signal.aborted) setState({ key: requestKey, data, status: "ready" });
        }).catch((error) => {
            if (!controller.signal.aborted) setState({ key: requestKey, data: null, status: "error",
                message: error.response?.status === 404 ? "존재하지 않는 스트리머입니다." : "통계를 불러오지 못했습니다." });
        });
        return () => controller.abort();
    }, [streamerNo, year, requestKey, retry]);
    const valid = /^\d+$/.test(year) && Number(year) >= 1 && Number(year) <= 9998 &&
        /^\d+$/.test(streamerNo ?? "") && Number(streamerNo) >= 1;
    const data = state.key === requestKey && valid ? state.data : null;
    return <div className="streamer-monthly-page">
        <section className="stat-chart-panel streamer-monthly-controls" aria-label="통계 조회 조건">
            <div className="streamer-monthly-search">
                <input id="stat-streamer-search" className="form-control" type="search" placeholder="스트리머 이름"
                    value={keyword} onChange={(event) => { setKeyword(event.target.value); setSearch({ items: [], status: "idle" }); }} />
                {keyword.trim() && <div className="streamer-monthly-results" aria-live="polite">
                    {search.status === "loading" && <p>검색 중...</p>}
                    {search.status === "error" && <p role="alert">검색하지 못했습니다. 다시 입력해주세요.</p>}
                    {search.status === "ready" && !search.items.length && <p>검색 결과가 없습니다.</p>}
                    {search.items.map((item) => <button type="button" key={item.streamerNo}
                        onClick={() => { updateParams({ streamerNo: String(item.streamerNo) }); setKeyword(""); }}>
                        <img src={buildProfileUrl(item.streamerSoopId)} alt="" />{item.streamerName}
                    </button>)}
                </div>}
            </div>
            <label className="stat-year-control">
                <input className="form-control" type="number" min="1" max="9998" value={year}
                    onChange={(event) => updateParams({ year: event.target.value })} />
            </label>
        </section>
        {!streamerNo ? <p className="stat-status">통계를 확인할 스트리머를 검색해 선택해주세요.</p>
            : !valid ? <p className="stat-status" role="alert">올바른 스트리머 번호와 연도(1~9998)를 선택해주세요.</p>
            : state.key !== requestKey || state.status === "loading" ? <p className="stat-status" role="status">통계를 불러오는 중입니다...</p>
            : state.status === "error" ? <div className="stat-status" role="alert">{state.message} <button className="btn btn-outline-primary" onClick={() => setRetry(retry + 1)}>다시 시도</button></div> : null}
        {data && <>
            <h2 className="streamer-monthly-title"><Link to={`/streamer/${data.streamer.streamerNo}`}>
                <img src={buildProfileUrl(data.streamer.streamerSoopId)} alt="" />{data.streamer.streamerName}
            </Link> · {data.year}년</h2>
            <div className="streamer-monthly-summary">
                {[["CK 참여", `${data.summary.participationCount}경기`], ["승리", `${data.summary.winCount}승`],
                    ["패배", `${data.summary.loseCount}패`], ["연간 누적 승률", formatRate(data.summary.winRate)]].map(([label, value]) =>
                    <div className="stat-chart-panel" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
            {data.summary.participationCount === 0 ? <p className="stat-status">선택한 연도에 등록된 CK 참여 기록이 없습니다.</p> : <>
                <StreamerMonthlyCharts data={data} />
                <details className="stat-chart-panel">
                    <summary>월별 전적 및 누적 승률 자세히 보기</summary>
                    <div className="table-responsive"><table className="table table-dark">
                        <thead><tr>{["월", "참여", "월간 전적", "누적 전적", "누적 승률", "전월 대비"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
                        <tbody>{data.months.map((month) => <tr key={month.month}>
                            <th>{month.month}월</th><td>{month.participationCount}</td><td>{month.winCount}승 {month.loseCount}패</td>
                            <td>{month.cumulativeWinCount}승 {month.cumulativeLoseCount}패</td>
                            <td>{formatRate(month.cumulativeWinRate)}</td><td>{formatChange(month.winRateChange)}</td>
                        </tr>)}</tbody>
                    </table></div>
                </details>
                <section className="stat-chart-panel">
                    <h2>연간 자주 만난 상대 TOP 5</h2>
                    <p>반대 진영에서 같은 포지션으로 만난 상대입니다. 전적은 {data.streamer.streamerName} 기준입니다.</p>
                    {!data.opponents.length ? <p>동일 포지션 맞대결 기록이 없습니다.</p> :
                        <div className="table-responsive"><table className="table table-dark streamer-monthly-opponents">
                            <thead><tr>{["순위", "상대", "맞대결", "전적", "승률", "마지막 맞대결"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
                            <tbody>{data.opponents.map((opponent) => <tr key={opponent.streamerNo}>
                                <td>{opponent.rank}</td><td><Link to={`/streamer/${opponent.streamerNo}`}>
                                    <img src={buildProfileUrl(opponent.streamerSoopId)} alt="" />{opponent.streamerName}</Link></td>
                                <td>{opponent.matchCount}경기</td><td>{opponent.winCount}승 {opponent.loseCount}패</td>
                                <td>{formatRate(opponent.winRate)}</td><td>{opponent.lastMatchDate?.slice(0, 10)}</td>
                            </tr>)}</tbody>
                        </table></div>}
                </section>
            </>}
        </>}
        <section className="stat-description" aria-labelledby="streamer-stat-criteria-title">
            <h2 id="streamer-stat-criteria-title">통계 집계 기준</h2>
            <p>SOOPLOL 등록 기록 기준입니다. 결과 미확정 경기는 참여·포지션 수에만 포함합니다.
                누적 승률은 연초부터 계산하며, 최초 유효 승률의 전월 대비 값은 표시하지 않습니다. 미래 월의 누적 승률은 표시하지 않습니다.</p>
        </section>
    </div>;
}
