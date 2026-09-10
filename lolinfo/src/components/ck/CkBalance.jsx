import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../../utils/axios";
import "./CkBalance.css";
import { buildProfileUrl } from "../../utils/profileUrl";

const POSITIONS = ["TOP", "JUG", "MID", "AD", "SUP"];
const LABELS = { TOP: "탑", JUG: "정글", MID: "미드", AD: "원딜", SUP: "서폿" };
const emptyRequest = { status: "loading", rows: [] };

function ProfileImage({ soopId }) {
    return <img key={soopId || "default"} className="balance-profile" src={buildProfileUrl(soopId)}
        alt="" width="40" height="40" loading="lazy" onError={event => {
            const image = event.currentTarget;
            if (image.dataset.fallback) return;
            image.dataset.fallback = "true";
            image.src = buildProfileUrl(null);
        }} />;
}

function MatchRow({ row, onClick, active = false }) {
    const content = <>
        <span className="balance-person"><ProfileImage soopId={row.opponentSoopId} /><strong>{row.opponentName}</strong></span>
        <span className="balance-meta">{Number(row.matchCount).toLocaleString("ko-KR")}경기 · 최근 {row.lastMatchDate?.slice(0, 10) || "날짜 없음"}</span>
    </>;
    return onClick
        ? <button type="button" className={`balance-match ${active ? "is-active" : ""}`} onClick={onClick} aria-pressed={active}>{content}</button>
        : <div className="balance-match">{content}</div>;
}

function ExpandedMatches({ baseNo, selected }) {
    const [result, setResult] = useState(emptyRequest);
    useEffect(() => {
        const controller = new AbortController();
        axios.get("/ck/balance", {
            params: { streamerNo: selected.opponentNo, position: selected.position, baseStreamerNo: baseNo },
            signal: controller.signal,
        }).then(({ data }) => {
            if (!Array.isArray(data)) throw new Error("Invalid response");
            if (!controller.signal.aborted) setResult({ status: "ready", rows: data });
        }).catch(() => {
            if (!controller.signal.aborted) setResult({ status: "error", rows: [] });
        });
        return () => controller.abort();
    }, [baseNo, selected.opponentNo, selected.position]);
    return <>
        <p className="balance-selected"><ProfileImage soopId={selected.opponentSoopId} />{selected.opponentName} <span className="badge bg-primary">{LABELS[selected.position]} · {selected.position}</span></p>
        {result.status === "loading" && <p role="status">맞라인 기록을 불러오는 중입니다.</p>}
        {result.status === "error" && <p role="alert" className="text-danger">기록을 불러오지 못했습니다. 상대를 다시 선택해주세요.</p>}
        {result.status === "ready" && (result.rows.length
            ? result.rows.map(row => <MatchRow key={`${row.opponentNo}-${row.position}`} row={row} />)
            : <p className="balance-muted">기준 스트리머를 제외한 맞라인 기록이 없습니다.</p>)}
    </>;
}

function BalanceResults({ baseNo, knownName }) {
    const [result, setResult] = useState(emptyRequest);
    const [selected, setSelected] = useState(null);
    const [selectionVersion, setSelectionVersion] = useState(0);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        if (!baseNo) return;
        const controller = new AbortController();
        axios.get("/ck/balance", { params: { streamerNo: baseNo }, signal: controller.signal })
            .then(({ data }) => {
                if (!Array.isArray(data)) throw new Error("Invalid response");
                if (!controller.signal.aborted) setResult({ status: "ready", rows: data });
            }).catch(() => {
                if (!controller.signal.aborted) setResult({ status: "error", rows: [] });
            });
        return () => controller.abort();
    }, [baseNo, knownName, retry]);
    return <>
        <section className="balance-panel" aria-labelledby="balance-opponents">
            <h2 id="balance-opponents"><span>2</span> 맞라인 상대</h2>
            {baseNo && <p className="balance-selected">기준: {knownName || `스트리머 #${baseNo}`}</p>}
            {!baseNo ? <p className="balance-muted">기준 스트리머를 선택해주세요.</p>
                : result.status === "loading" ? <p role="status">맞라인 기록을 불러오는 중입니다.</p>
                : result.status === "error" ? <div role="alert"><p className="text-danger">기록을 불러오지 못했습니다.</p><button type="button" className="btn btn-outline-light btn-sm" onClick={() => { setResult(emptyRequest); setRetry(value => value + 1); }}>다시 시도</button></div>
                : result.rows.length === 0 ? <p className="balance-muted">등록된 맞라인 기록이 없습니다.</p>
                : POSITIONS.map(position => {
                    const rows = result.rows.filter(row => row.position === position);
                    return <section className="balance-position" key={position}>
                        <h3>{position} <span>{LABELS[position]}</span></h3>
                        {rows.length ? rows.map(row => <MatchRow key={`${row.opponentNo}-${position}`} row={row}
                            active={selected?.opponentNo === row.opponentNo && selected?.position === position}
                            onClick={() => { setSelected(row); setSelectionVersion(value => value + 1); }} />)
                            : <p className="balance-muted">맞라인 기록이 없습니다.</p>}
                    </section>;
                })}
        </section>
        <section className="balance-panel" aria-labelledby="balance-expanded">
            <h2 id="balance-expanded"><span>3</span> 선택 상대의 맞라인</h2>
            {selected ? <ExpandedMatches key={`${baseNo}-${selected.opponentNo}-${selected.position}-${selectionVersion}`} baseNo={baseNo} selected={selected} />
                : <p className="balance-muted">맞라인 상대를 선택해주세요.</p>}
        </section>
    </>;
}

export default function CkBalance() {
    const [params, setParams] = useSearchParams();
    const rawNo = params.get("streamerNo");
    const baseNo = /^[1-9]\d*$/.test(rawNo || "") && Number.isSafeInteger(Number(rawNo)) ? Number(rawNo) : null;
    const [chosen, setChosen] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [search, setSearch] = useState({ status: "idle", rows: [] });
    const [searchOpen, setSearchOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const trimmed = keyword.trim();
    // 기존 스트리머 자동완성 API/필드 및 300ms debounce를 재사용한다.
    useEffect(() => {
        if (!searchOpen || !trimmed) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            axios.get("/streamer/autoSearch", { params: { keyword: trimmed }, signal: controller.signal })
                .then(({ data }) => {
                    if (!Array.isArray(data)) throw new Error("Invalid response");
                    if (!controller.signal.aborted) setSearch({ status: "ready", rows: data });
                }).catch(() => {
                    if (!controller.signal.aborted) setSearch({ status: "error", rows: [] });
                });
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [keyword, trimmed, searchOpen]);
    const choose = (streamer) => {
        setChosen(streamer);
        setKeyword(streamer.streamerName);
        setSearchOpen(false);
        setHighlight(-1);
        setSearch({ status: "idle", rows: [] });
        setParams(previous => { const next = new URLSearchParams(previous); next.set("streamerNo", streamer.streamerNo); return next; }, { replace: true });
    };
    const knownName = Number(chosen?.streamerNo) === baseNo ? chosen.streamerName : "";
    return <div className="balance-page">
        <h1 className="page-title mb-4">밸런스 찾기</h1>
        <div className="balance-grid">
            <section className="balance-panel" aria-labelledby="balance-base">
                <h2 id="balance-base"><span>1</span> 기준 스트리머</h2>
                <label htmlFor="balance-search" className="form-label">스트리머 이름</label>
                <div onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
                    <input id="balance-search" className="form-control" value={keyword} autoComplete="off" placeholder="이름을 검색하세요"
                        role="combobox" aria-expanded={searchOpen && !!trimmed} aria-controls="balance-search-results" aria-autocomplete="list"
                        aria-activedescendant={highlight >= 0 && search.rows[highlight] ? `balance-option-${highlight}` : undefined}
                        onFocus={() => { setSearchOpen(true); setSearch({ status: "loading", rows: [] }); setHighlight(-1); }}
                        onChange={event => { setKeyword(event.target.value); setSearchOpen(true); setSearch({ status: "loading", rows: [] }); setHighlight(-1); }}
                        onKeyDown={event => {
                            if (event.key === "Escape") { setSearchOpen(false); setHighlight(-1); }
                            if (searchOpen && search.rows.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                                event.preventDefault();
                                setHighlight(value => event.key === "ArrowDown" ? (value + 1) % search.rows.length : (value <= 0 ? search.rows.length - 1 : value - 1));
                            }
                            if (event.key === "Enter" && searchOpen && search.rows[highlight]) { event.preventDefault(); choose(search.rows[highlight]); }
                        }} />
                    <ul id="balance-search-results" className="balance-search-results" role="listbox" aria-label="스트리머 검색 결과">
                        {searchOpen && trimmed && search.rows.map((streamer, index) => <li role="option" id={`balance-option-${index}`} key={streamer.streamerNo} aria-selected={highlight === index}>
                            <button type="button" className={highlight === index ? "is-active" : ""} onClick={() => choose(streamer)}>{streamer.streamerName}</button>
                        </li>)}
                    </ul>
                </div>
                {searchOpen && trimmed && <div role="status" className="balance-muted">
                    {search.status === "loading" ? "검색 중입니다." : search.status === "error" ? "검색에 실패했습니다. 이름을 다시 입력해주세요." : search.status === "ready" && !search.rows.length ? "검색 결과가 없습니다." : null}
                </div>}
                {rawNo && !baseNo && <p className="text-danger" role="alert">스트리머 번호가 올바르지 않습니다. 이름으로 다시 선택해주세요.</p>}
                {baseNo && <SelectedBase key={`${baseNo}-${knownName}`} baseNo={baseNo} knownName={knownName} knownSoopId={chosen?.streamerNo && Number(chosen.streamerNo) === baseNo ? chosen.streamerSoopId : null} />}
            </section>
            <BalanceResults key={`${baseNo}-${knownName}`} baseNo={baseNo} knownName={knownName} />
        </div>
    </div>;
}

function SelectedBase({ baseNo, knownName, knownSoopId }) {
    const [name, setName] = useState(knownName);
    const [soopId, setSoopId] = useState(knownSoopId);
    useEffect(() => {
        if (knownName && knownSoopId) return;
        const controller = new AbortController();
        axios.get(`/streamer/${baseNo}`, { signal: controller.signal }).then(({ data }) => {
            if (!controller.signal.aborted) { setName(data.streamerName || "이름 확인 불가"); setSoopId(data.streamerSoopId); }
        }).catch(() => { if (!controller.signal.aborted) setName("이름을 불러오지 못했습니다."); });
        return () => controller.abort();
    }, [baseNo, knownName, knownSoopId]);
    return <div className="balance-base-selection"><span className="balance-muted">선택한 스트리머</span><span className="balance-person"><ProfileImage soopId={soopId} /><strong>{name || "이름 확인 중…"}</strong></span></div>;
}
