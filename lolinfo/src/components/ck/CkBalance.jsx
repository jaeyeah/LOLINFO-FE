import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Handle, Position, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "../../utils/axios";
import "./CkBalance.css";
import { buildProfileUrl } from "../../utils/profileUrl";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

const POSITIONS = ["TOP", "JUG", "MID", "AD", "SUP"];
const LABELS = { TOP: "탑", JUG: "정글", MID: "미드", AD: "원딜", SUP: "서폿" };
const POSITION_COLORS = { TOP: "#ff6b6b", JUG: "#69db7c", MID: "#4dabf7", AD: "#ffa94d", SUP: "#da77f2" };

function getBalanceRequestKey(streamerNo, position, baseNo) {
    return `${streamerNo}:${position || "ALL"}:${baseNo}`;
}

function BalanceInfo() {
    const [open, setOpen] = useState(false);
    const id = useId();
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    useEffect(() => {
        if (!open) return undefined;
        const dismissOutside = event => {
            if (!containerRef.current?.contains(event.target)) setOpen(false);
        };
        const dismissEscape = event => {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", dismissOutside);
        document.addEventListener("keydown", dismissEscape);
        return () => {
            document.removeEventListener("pointerdown", dismissOutside);
            document.removeEventListener("keydown", dismissEscape);
        };
    }, [open]);
    return <div className="balance-info" ref={containerRef}>
        <button ref={buttonRef} type="button" className="balance-info-toggle" aria-label="밸런스 찾기 이용 안내"
            aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
            <FaInfoCircle aria-hidden="true" />
        </button>
        <section id={id} className="balance-info-note" hidden={!open} aria-labelledby={`${id}-title`}>
            <div className="balance-info-header">
                <strong id={`${id}-title`}>밸런스 찾기 안내</strong>
                <button type="button" className="balance-info-close" aria-label="이용 안내 닫기"
                    onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>
                    <FaTimes aria-hidden="true" />
                </button>
            </div>
            <ol>
                <li>기준 스트리머를 검색하면 SOOPLOL에 등록된 CK 기록을 바탕으로 라인별 맞라인 상대를 확인할 수 있습니다.</li>
                <li>스트리머 상세에서 이동하면 해당 스트리머가 자동으로 검색된 상태로 시작합니다.</li>
                <li>라인 버튼을 누르면 원하는 포지션의 상대만 필터링할 수 있습니다.</li>
                <li>상대를 선택하면 해당 스트리머를 그래프 중심으로 옮겨 다음 맞라인 상대를 탐색할 수 있습니다.</li>
            </ol>
            <strong className="balance-info-subtitle">기대되는 점</strong>
            <ul>
                <li>라인별 전적을 기준으로 실력과 플레이 성향이 비슷한 상대를 빠르게 비교할 수 있습니다.</li>
                <li>특정 라인에서 유리하거나 어려운 맞라인 상대를 확인해 대진과 팀 구성을 검토할 수 있습니다.</li>
                <li>등록된 CK 기록을 활용해 감이 아닌 실제 경기 데이터에 기반한 상대 탐색이 가능합니다.</li>
            </ul>
        </section>
    </div>;
}

function ProfileImage({ soopId }) {
    return <img key={soopId || "default"} className="balance-profile" src={buildProfileUrl(soopId)}
        alt="" width="40" height="40" loading="lazy" onError={event => {
            const image = event.currentTarget;
            if (image.dataset.fallback) return;
            image.dataset.fallback = "true";
            image.src = buildProfileUrl(null);
        }} />;
}

function getWinRateColor(rate) {
    if (rate >= 60) return "#76c1ff";
    if (rate >= 55) return "#69db7c";
    if (rate >= 50) return "#adb5bd";
    if (rate >= 45) return "#bdb088";
    if (rate >= 40) return "#ffba79";
    return "#ff6b6b";
}

function normalizeRate(value) {
    const rate = Number(value);
    return Number.isFinite(rate) ? Math.max(0, Math.min(100, rate)) : 0;
}

function MatchRow({ row, onClick, active = false }) {
    const winCount = Number(row.winCount || 0);
    const loseCount = Number(row.loseCount || 0);
    const winRate = normalizeRate(row.winRate);
    const rateColor = getWinRateColor(winRate);
    const content = <span className="balance-match-content">
        <span className="balance-match-left">
            <span className="balance-person"><ProfileImage soopId={row.opponentSoopId} /><strong>{row.opponentName}</strong><span className="balance-match-position">{LABELS[row.position] || row.position}</span></span>
            <span className="balance-meta">{Number(row.matchCount).toLocaleString("ko-KR")}경기 · 최근 {row.lastMatchDate?.slice(0, 10) || "날짜 없음"}</span>
        </span>
        <span className="balance-match-right">
            <span className="balance-record-row">
                <span className="balance-record-score">{winCount}승 {loseCount}패</span>
                <span className="balance-record-rate" style={{ color: rateColor }}>{winRate}%</span>
            </span>
            <span className="balance-progress" aria-label={`승률 ${winRate}%`}>
                <span className="balance-progress-bar" style={{ width: `${winRate}%`, background: `linear-gradient(90deg, #4dabf7, ${rateColor})` }} />
            </span>
        </span>
    </span>;
    return onClick
        ? <button type="button" className={`balance-match ${active ? "is-active" : ""}`} onClick={onClick} aria-pressed={active}>{content}</button>
        : <div className="balance-match">{content}</div>;
}

const BalanceGraphNode = memo(function BalanceGraphNode({ data }) {
    const { streamer, root, loading, onSelect, nodeWidth } = data;
    const name = root ? streamer.streamerName : streamer.opponentName;
    const soopId = root ? streamer.streamerSoopId : streamer.opponentSoopId;
    const label = root ? "기준 스트리머" : `${name}, ${LABELS[streamer.position] || streamer.position}, ${Number(streamer.matchCount || 0)}경기`;
    const content = <>
        <ProfileImage soopId={soopId} />
        <strong className="balance-node-name" title={name}>{name || `스트리머 #${streamer.streamerNo || streamer.opponentNo}`}</strong>
        {root ? <span className="balance-node-tag">기준 스트리머</span> : <>
            <span className="balance-node-tag" style={{ "--balance-position-color": POSITION_COLORS[streamer.position] || "#adb5bd" }}>{LABELS[streamer.position] || streamer.position} · {streamer.position}</span>
            <span className="balance-node-meta">{Number(streamer.matchCount || 0).toLocaleString("ko-KR")}전 · {streamer.lastMatchDate?.toString().slice(0, 10) || "날짜 없음"}</span>
        </>}
    </>;
    return root ? <>
        <div className="balance-node balance-node-root" style={nodeWidth ? { width: nodeWidth } : undefined} role="img" aria-label={label}>{content}</div>
        <Handle id="source-top" type="source" position={Position.Top} isConnectable={false} />
        <Handle id="source-right" type="source" position={Position.Right} isConnectable={false} />
        <Handle id="source-bottom" type="source" position={Position.Bottom} isConnectable={false} />
        <Handle id="source-left" type="source" position={Position.Left} isConnectable={false} />
    </> : <>
        <button type="button" className="balance-node balance-node-opponent" style={nodeWidth ? { width: nodeWidth } : undefined} aria-label={label} disabled={loading}
            onClick={event => { event.stopPropagation(); onSelect(streamer); }}>{content}</button>
        <Handle id="target-top" type="target" position={Position.Top} isConnectable={false} />
        <Handle id="target-right" type="target" position={Position.Right} isConnectable={false} />
        <Handle id="target-bottom" type="target" position={Position.Bottom} isConnectable={false} />
        <Handle id="target-left" type="target" position={Position.Left} isConnectable={false} />
    </>;
});

const BalanceLaneNode = memo(function BalanceLaneNode({ data }) {
    const { position, rows, loading, onSelect, nodeWidth, active } = data;
    const targetSide = { TOP: "bottom", JUG: "left", MID: "left", AD: "top", SUP: "right" }[position];
    const targetPosition = { top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left }[targetSide];
    return <>
        <section className={`balance-lane-node ${active ? "" : "is-inactive"}`} style={{ width: nodeWidth }} role="group" aria-label={`${LABELS[position]} 맞라인 상대`} aria-disabled={!active}>
        <div className="balance-lane-heading" style={{ "--balance-position-color": POSITION_COLORS[position] }}>
            <strong>{position} <span>{LABELS[position]}</span></strong><span>{rows.length}명</span>
        </div>
        {rows.length ? <div className="balance-lane-list nowheel nopan">
            {rows.map(row => <button type="button" key={balanceNodeId(row)} disabled={loading}
                aria-label={`${row.opponentName}, ${LABELS[position]}, ${Number(row.matchCount || 0)}경기, 최근 ${row.lastMatchDate?.toString().slice(0, 10) || "날짜 없음"}`}
                onClick={event => { event.stopPropagation(); onSelect(row); }}>
                <ProfileImage soopId={row.opponentSoopId} />
                <span className="balance-lane-details">
                    <span className="balance-lane-main"><span className="balance-lane-name" title={row.opponentName}>{row.opponentName}</span><span className="balance-lane-count">{Number(row.matchCount || 0)}전</span></span>
                    <span className="balance-lane-date">최근 {row.lastMatchDate?.toString().slice(0, 10) || "날짜 없음"}</span>
                </span>
            </button>)}
        </div> : <p className="balance-lane-empty">맞라인 상대 없음</p>}
        </section>
        <Handle id={`target-${targetSide}`} type="target" position={targetPosition} isConnectable={false} />
    </>;
});

const nodeTypes = { balanceStreamer: BalanceGraphNode, balanceLane: BalanceLaneNode };

function balanceNodeId(row) {
    return `${row.opponentNo}-${row.position}`;
}

function BalanceFlow({ center, rows, loading, onSelect, positionFilter }) {
    const flowRef = useRef(null);
    const { fitView } = useReactFlow();
    const [size, setSize] = useState({ width: 900, height: 560 });
    useEffect(() => {
        const element = flowRef.current;
        if (!element) return undefined;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width && height) setSize({ width, height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    const isMobileLayout = size.width < 576;
    const rowsByPosition = useMemo(() => Object.fromEntries(POSITIONS.map(position => [position, rows.filter(row => row.position === position)])), [rows]);

    const nodes = useMemo(() => {
        const { width, height } = size;
        const centerX = width / 2;
        const centerY = height / 2;
        const outer = Math.max(1, rows.length);
        if (isMobileLayout) {
            const rootWidth = Math.min(116, width - 28);
            const laneWidth = Math.min(122, (width - 24) / 2);
            const sideX = { left: 8, right: width - laneWidth - 8, center: centerX - laneWidth / 2 };
            const mobileItems = [{ id: "balance-center", type: "balanceStreamer", position: { x: centerX - rootWidth / 2, y: 192 }, data: { streamer: center, root: true, loading, onSelect, nodeWidth: rootWidth } }];
            const laneLayout = {
                TOP: { x: sideX.center, y: -4 },
                JUG: { x: sideX.right, y: 96 },
                MID: { x: sideX.right, y: 334 },
                AD: { x: sideX.center, y: 434 },
                SUP: { x: sideX.left, y: 334 },
            };
            POSITIONS.forEach(position => mobileItems.push({
                id: `balance-lane-${position}`,
                type: "balanceLane",
                position: laneLayout[position],
                data: { position, rows: rowsByPosition[position], loading, onSelect, nodeWidth: laneWidth, active: positionFilter === "ALL" || positionFilter === position },
            }));
            return mobileItems;
        }
        const xRadius = Math.max(170, Math.min(width * 0.36, 320));
        const yRadius = Math.max(145, Math.min(height * 0.35, 230));
        const items = [{ id: "balance-center", type: "balanceStreamer", position: { x: centerX - 96, y: centerY - 76 }, data: { streamer: center, root: true, loading, onSelect } }];
        rows.forEach((row, index) => {
            let angle;
            let ring = 0;
            if (outer === 1) angle = 0;
            else if (outer === 2) angle = index === 0 ? Math.PI : 0;
            else if (outer <= 8) angle = (2 * Math.PI * index) / outer - Math.PI / 2;
            else {
                const innerCount = Math.ceil(outer / 2);
                ring = index >= innerCount ? 1 : 0;
                const count = ring ? outer - innerCount : innerCount;
                const ringIndex = ring ? index - innerCount : index;
                angle = (2 * Math.PI * ringIndex) / count - Math.PI / 2 + (ring ? Math.PI / count : 0);
            }
            const multiplier = ring ? 1.55 : 1;
            const x = centerX + Math.cos(angle) * xRadius * multiplier;
            const y = centerY + Math.sin(angle) * yRadius * multiplier;
            items.push({ id: balanceNodeId(row), type: "balanceStreamer", position: { x: x - 78, y: y - 56 }, data: { streamer: row, root: false, loading, onSelect } });
        });
        return items;
    }, [center, isMobileLayout, loading, onSelect, positionFilter, rows, rowsByPosition, size]);

    const maxCount = useMemo(() => Math.max(1, ...rows.map(row => Number(row.matchCount || 0))), [rows]);
    const edges = useMemo(() => {
        if (isMobileLayout) return POSITIONS.flatMap(position => {
            const laneRows = rowsByPosition[position];
            if (!laneRows.length) return [];
            const matchCount = laneRows.reduce((sum, row) => sum + Number(row.matchCount || 0), 0);
            const color = POSITION_COLORS[position] || "#adb5bd";
            const sourceSide = { TOP: "top", JUG: "right", MID: "right", AD: "bottom", SUP: "left" }[position];
            const targetSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[sourceSide];
            return [{
                id: `edge-lane-${position}`,
                source: "balance-center",
                target: `balance-lane-${position}`,
                sourceHandle: `source-${sourceSide}`,
                targetHandle: `target-${targetSide}`,
                type: "straight",
                label: `${laneRows.length}명`,
                style: { stroke: color, strokeWidth: 1.5 + (Math.log1p(matchCount) / Math.log1p(Math.max(1, rows.reduce((sum, row) => sum + Number(row.matchCount || 0), 0)))) * 3.5, opacity: 0.8 },
                labelStyle: { fill: "#f8f9fa", fontWeight: 700, fontSize: 11 },
                labelBgStyle: { fill: "#15191f", fillOpacity: 0.94 },
                labelBgPadding: [4, 2],
                labelBgBorderRadius: 4,
                selectable: false,
            }];
        });
        return rows.map((row, index) => {
            const matchCount = Number(row.matchCount || 0);
            const width = 1.5 + (Math.log1p(matchCount) / Math.log1p(maxCount)) * 3.5;
            const color = POSITION_COLORS[row.position] || "#adb5bd";
            const { width: graphWidth, height: graphHeight } = size;
            const centerX = graphWidth / 2;
            const centerY = graphHeight / 2;
            const outer = Math.max(1, rows.length);
            let angle;
            let ring = 0;
            if (outer === 1) angle = 0;
            else if (outer === 2) angle = index === 0 ? Math.PI : 0;
            else if (outer <= 8) angle = (2 * Math.PI * index) / outer - Math.PI / 2;
            else {
                const innerCount = Math.ceil(outer / 2);
                ring = index >= innerCount ? 1 : 0;
                const count = ring ? outer - innerCount : innerCount;
                const ringIndex = ring ? index - innerCount : index;
                angle = (2 * Math.PI * ringIndex) / count - Math.PI / 2 + (ring ? Math.PI / count : 0);
            }
            const x = centerX + Math.cos(angle) * Math.max(170, Math.min(graphWidth * 0.36, 320)) * (ring ? 1.55 : 1);
            const y = centerY + Math.sin(angle) * Math.max(145, Math.min(graphHeight * 0.35, 230)) * (ring ? 1.55 : 1);
            const dx = x - centerX;
            const dy = y - centerY;
            const sourceSide = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "bottom" : "top");
            const targetSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[sourceSide];
            return {
                id: `edge-${balanceNodeId(row)}`,
                source: "balance-center",
                target: balanceNodeId(row),
                sourceHandle: `source-${sourceSide}`,
                targetHandle: `target-${targetSide}`,
                type: "straight",
                label: `${matchCount}전`,
                style: { stroke: color, strokeWidth: width, opacity: 0.8 },
                labelStyle: { fill: "#f8f9fa", fontWeight: 700, fontSize: 12 },
                labelBgStyle: { fill: "#15191f", fillOpacity: 0.94 },
                labelBgPadding: [5, 3],
                labelBgBorderRadius: 4,
                selectable: false,
            };
        });
    }, [isMobileLayout, maxCount, rows, rowsByPosition, size]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => fitView({ padding: isMobileLayout ? 0.035 : 0.12, duration: 180, minZoom: 0.35, maxZoom: 1 }));
        return () => cancelAnimationFrame(frame);
    }, [fitView, isMobileLayout, nodes, edges, positionFilter]);

    return <div className="balance-flow" ref={flowRef} aria-label="맞라인 상대 네트워크 그래프">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.12, minZoom: 0.35, maxZoom: 1 }}
            nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} panOnDrag zoomOnScroll zoomOnPinch
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}>
        </ReactFlow>
        {loading && <div className="balance-flow-loading" role="status">맞라인 기록을 불러오는 중입니다.</div>}
    </div>;
}

function BalanceResults({ baseNo, knownName, knownSoopId }) {
    const [rows, setRows] = useState([]);
    const [status, setStatus] = useState("loading");
    const [center, setCenter] = useState({ streamerNo: baseNo, streamerName: knownName, streamerSoopId: knownSoopId });
    const [view, setView] = useState("graph");
    const [positionFilter, setPositionFilter] = useState("ALL");
    const [requestTarget, setRequestTarget] = useState({ target: { streamerNo: baseNo, streamerName: knownName, streamerSoopId: knownSoopId }, position: null });
    const requestRef = useRef(null);
    const requestIdRef = useRef(0);
    const cacheRef = useRef(new Map());
    const root = useMemo(() => ({ streamerNo: baseNo, streamerName: knownName || `스트리머 #${baseNo}`, streamerSoopId: knownSoopId }), [baseNo, knownName, knownSoopId]);
    const rootRef = useRef(root);
    rootRef.current = root;
    const load = useCallback(async (target, position) => {
        if (!baseNo) return;
        const streamerNo = Number(target.streamerNo || target.opponentNo);
        const key = getBalanceRequestKey(streamerNo, position, baseNo);
        const nextCenter = { streamerNo, streamerName: target.streamerName || target.opponentName, streamerSoopId: target.streamerSoopId || target.opponentSoopId, position };
        setRequestTarget({ target: nextCenter, position });
        requestRef.current?.abort();
        const requestId = ++requestIdRef.current;
        if (cacheRef.current.has(key)) {
            setCenter(nextCenter);
            setRows(cacheRef.current.get(key));
            setStatus("ready");
            return;
        }
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        try {
            const params = { streamerNo };
            if (position) params.position = position;
            if (streamerNo !== baseNo) params.baseStreamerNo = baseNo;
            const { data } = await axios.get("/ck/balance", { params, signal: controller.signal });
            if (!Array.isArray(data)) throw new Error("Invalid response");
            if (controller.signal.aborted || requestId !== requestIdRef.current) return;
            cacheRef.current.set(key, data);
            setCenter(nextCenter);
            setRows(data);
            setStatus("ready");
        } catch {
            if (controller.signal.aborted || requestId !== requestIdRef.current) return;
            setStatus("error");
        }
    }, [baseNo]);

    useEffect(() => {
        setStatus("loading");
        load(rootRef.current, null);
        return () => requestRef.current?.abort();
    }, [baseNo, load]);

    const filteredRows = useMemo(() => positionFilter === "ALL" ? rows : rows.filter(row => row.position === positionFilter), [positionFilter, rows]);
    const onSelect = useCallback(row => {
        if (status === "loading") return;
        setPositionFilter("ALL");
        load({ streamerNo: row.opponentNo, streamerName: row.opponentName, streamerSoopId: row.opponentSoopId }, row.position);
    }, [load, status]);
    const goToRoot = useCallback(() => {
        setPositionFilter("ALL");
        load(root, null);
    }, [load, root]);
    const retry = useCallback(() => load(requestTarget.target, requestTarget.position), [load, requestTarget]);
    const listRows = useMemo(() => POSITIONS.flatMap(position => filteredRows.filter(row => row.position === position)), [filteredRows]);
    const displayCenter = Number(center.streamerNo) === Number(baseNo) ? root : center;
    if (!baseNo) return <section className="balance-panel balance-results-panel"><h2><span>2</span> 맞라인 네트워크</h2><p className="balance-muted">기준 스트리머를 선택하면 맞라인 기록이 표시됩니다.</p></section>;
    return <>
        <section className="balance-panel balance-results-panel" aria-labelledby="balance-opponents">
            <div className="balance-results-heading">
                <div><h2 id="balance-opponents"><span>2</span> 맞라인 네트워크</h2>
                    <p className="balance-muted">상대 노드를 선택하면 해당 스트리머를 중심으로 맞라인을 탐색합니다.</p></div>
                <div className="balance-view-toggle" role="group" aria-label="결과 보기 방식">
                    <button type="button" className={view === "graph" ? "is-active" : ""} aria-pressed={view === "graph"} onClick={() => setView("graph")}>그래프 보기</button>
                    <button type="button" className={view === "list" ? "is-active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}>목록 보기</button>
                </div>
            </div>
            <div className="balance-selected-wrap">
                <div className="balance-current-center"><span className="balance-muted">현재 기준</span><strong>{displayCenter.streamerName || root.streamerName}</strong>
                    {Number(displayCenter.streamerNo) !== Number(baseNo) && <button type="button" className="balance-back-button" onClick={goToRoot} disabled={status === "loading"}>처음 기준으로 돌아가기</button>}
                </div>
                <div className="balance-position-filter" aria-label="맞라인 포지션 필터">
                    <button type="button" className={`balance-filter-button ${positionFilter === "ALL" ? "is-active" : ""}`} onClick={() => setPositionFilter("ALL")}>전체</button>
                    {POSITIONS.map(position => <button key={position} type="button" className={`balance-filter-button ${positionFilter === position ? "is-active" : ""}`} onClick={() => setPositionFilter(position)}>{LABELS[position]}</button>)}
                </div>
            </div>
            {status === "error" && <div className="balance-error" role="alert"><span>맞라인 기록을 불러오지 못했습니다.</span><button type="button" className="btn btn-outline-light btn-sm" onClick={retry}>다시 시도</button></div>}
            {status === "ready" && !filteredRows.length && <p className="balance-empty">{rows.length ? "선택한 포지션에서 확인된 맞라인 상대가 없습니다." : "등록된 맞라인 기록이 없습니다."}</p>}
            {view === "graph" && filteredRows.length > 0 && <>
                <div className="balance-flow-legend" aria-label="포지션별 연결선 범례">{POSITIONS.map(position => <span key={position}><i style={{ background: POSITION_COLORS[position] }} />{LABELS[position]}</span>)}</div>
                <ReactFlowProvider><BalanceFlow center={displayCenter} rows={filteredRows} loading={status === "loading"} onSelect={onSelect} positionFilter={positionFilter} /></ReactFlowProvider>
            </>}
            {view === "list" && <div className="balance-list-results">
                {status === "loading" && <p className="balance-muted" role="status">맞라인 기록을 불러오는 중입니다.</p>}
                {listRows.map(row => <MatchRow key={balanceNodeId(row)} row={row} onClick={() => onSelect(row)} />)}
            </div>}
        </section>
    </>;
}

export default function CkBalance() {
    const [params, setParams] = useSearchParams();
    const rawNo = params.get("streamerNo");
    const baseNo = /^[1-9]\d*$/.test(rawNo || "") && Number.isSafeInteger(Number(rawNo)) ? Number(rawNo) : null;
    const [chosen, setChosen] = useState(null);
    const [resolvedBase, setResolvedBase] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [search, setSearch] = useState({ status: "idle", rows: [] });
    const [searchOpen, setSearchOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const trimmed = keyword.trim();
    const knownName = Number(chosen?.streamerNo) === baseNo ? chosen.streamerName : resolvedBase?.streamerNo === baseNo ? resolvedBase.streamerName : "";
    const knownSoopId = Number(chosen?.streamerNo) === baseNo ? chosen.streamerSoopId : resolvedBase?.streamerNo === baseNo ? resolvedBase.streamerSoopId : null;
    const handleBaseResolved = useCallback((streamerName, streamerSoopId) => {
        setResolvedBase({ streamerNo: baseNo, streamerName, streamerSoopId });
    }, [baseNo]);
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
    return <div className="balance-page">
        <section className="balance-hero">
            <p className="balance-eyebrow">SOOPLOL BALANCE</p>
            <div className="balance-title-row"><h1>밸런스 찾기</h1><BalanceInfo /></div>
            <p className="balance-context">기준 스트리머와 맞라인 상대의 최근 전적을 비교해보세요.</p>
        </section>
        <div className="balance-grid">
            <section className="balance-panel balance-base-panel" aria-labelledby="balance-base">
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
                {baseNo && <SelectedBase key={`${baseNo}-${knownName}`} baseNo={baseNo} knownName={knownName} knownSoopId={knownSoopId} onResolved={handleBaseResolved} />}
            </section>
            <BalanceResults key={baseNo} baseNo={baseNo} knownName={knownName} knownSoopId={knownSoopId} />
        </div>
    </div>;
}

function SelectedBase({ baseNo, knownName, knownSoopId, onResolved }) {
    const [name, setName] = useState(knownName);
    const [soopId, setSoopId] = useState(knownSoopId);
    useEffect(() => {
        if (knownName && knownSoopId) return;
        const controller = new AbortController();
        axios.get(`/streamer/${baseNo}`, { signal: controller.signal }).then(({ data }) => {
            if (!controller.signal.aborted) {
                const resolvedName = data.streamerName || "이름 확인 불가";
                setName(resolvedName);
                setSoopId(data.streamerSoopId);
                onResolved(resolvedName, data.streamerSoopId);
            }
        }).catch(() => { if (!controller.signal.aborted) setName("이름을 불러오지 못했습니다."); });
        return () => controller.abort();
    }, [baseNo, knownName, knownSoopId, onResolved]);
    return <div className="balance-base-selection"><span className="balance-muted">선택한 스트리머</span><span className="balance-person"><ProfileImage soopId={soopId} /><strong>{name || "이름 확인 중…"}</strong></span></div>;
}
