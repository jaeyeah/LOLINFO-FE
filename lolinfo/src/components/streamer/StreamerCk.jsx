import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import StreamerCkListSection from "./StreamerCkListSection";
import CkPeriodFilter from "./CkPeriodFilter";
import { formatCkPeriod } from "../../utils/ckPeriod";

ChartJS.register(ArcElement, Tooltip, Legend);

const positionTotalPlugin = {
  id: "positionTotal",
  afterDraw(chart, _args, options) {
    const arc = chart.getDatasetMeta(0).data[0];
    if (!arc) return;
    const { ctx } = chart;
    const maxWidth = Math.max(arc.innerRadius * 1.8, 1);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#adb5bd";
    ctx.font = "13px sans-serif";
    ctx.fillText("총", arc.x, arc.y - 12, maxWidth);
    ctx.fillStyle = "#f8f9fa";
    ctx.font = "600 18px sans-serif";
    ctx.fillText(`${options.total.toLocaleString()}경기`, arc.x, arc.y + 12, maxWidth);
    ctx.restore();
  },
};

const positionLabelPlugin = {
  id: "positionLabelPlugin",
  afterDatasetsDraw(chart, _args, options) {
    const meta = chart.getDatasetMeta(0);
    const arcs = meta?.data ?? [];
    const stats = options?.stats ?? [];
    const total = options?.totalPositionGames ?? 0;

    if (!arcs.length || !stats.length) return;

    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const fontSize = Math.min(Math.max(chart.width / 34, 10), 12);

    ctx.save();
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;

    stats.forEach((stat, index) => {
      if (!stat || stat.totalCount <= 0) return;

      const arc = arcs[index];
      if (!arc) return;

      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      const labelRatio = total > 0 ? ((stat.totalCount / total) * 100).toFixed(1) : "0.0";
      const labelText = `${stat.ckPosition} ${labelRatio}%`;

      const direction = Math.cos(midAngle) >= 0 ? 1 : -1;
      const startX = arc.x + Math.cos(midAngle) * arc.outerRadius;
      const startY = arc.y + Math.sin(midAngle) * arc.outerRadius;
      const outerX = arc.x + Math.cos(midAngle) * (arc.outerRadius + 20);
      const outerY = arc.y + Math.sin(midAngle) * (arc.outerRadius + 20);
      const textX = arc.x + Math.cos(midAngle) * (arc.outerRadius + 42);
      const textY = arc.y + Math.sin(midAngle) * (arc.outerRadius + 42);
      const labelFinalX = direction >= 0 ? textX + 8 : textX - 8;
      const labelFinalY = textY + (index % 2 === 0 ? -2 : 2);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(outerX, outerY);
      ctx.lineTo(direction >= 0 ? outerX + 16 : outerX - 16, outerY);
      ctx.stroke();

      ctx.fillStyle = "#e9ecef";
      ctx.textAlign = direction >= 0 ? "left" : "right";
      ctx.fillText(labelText, labelFinalX, labelFinalY);
    });

    ctx.restore();
  },
};

const POSITION_CHART_PLUGINS = [positionTotalPlugin, positionLabelPlugin];

const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];
const POSITION_CHART_COLORS = {
  TOP: "#f4c95d",
  JUG: "#8f9bb3",
  MID: "#55c59d",
  AD: "#ef7f8d",
  SUP: "#6f9df5",
};

export default function StreamerCk() {
  const { streamer, streamerId } = useOutletContext();
  return <StreamerCkPage key={streamerId} streamer={streamer} streamerId={streamerId} />;
}

function StreamerCkPage({ streamer, streamerId }) {
  const [period, setPeriod] = useState({ startDate: "", endDate: "" });
  return (
    <>
      <CkPeriodFilter period={period} onApply={setPeriod} />
      <StreamerCkContent key={`${streamerId}:${period.startDate}:${period.endDate}`}
        streamer={streamer} streamerId={streamerId} period={period} />
    </>
  );
}

function StreamerCkContent({ streamer, streamerId, period }) {
  const { startDate, endDate } = period;
  const periodLabel = formatCkPeriod(period);

  // 맞라인 상대 전적 관련 상태 (CK 목록과 독립적)
  const [vsPositionStats, setVsPositionStats] = useState([]);
  const [vsLoading, setVsLoading] = useState(true);
  const [vsError, setVsError] = useState(null);
  const [expandedVsStreamerNo, setExpandedVsStreamerNo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // 기간 전환 시 이전 요청을 취소해 다른 기간의 응답이 섞이지 않도록 한다.
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setVsLoading(true);
      setVsError(null);
      try {
        const { data } = await axios.get(`/ck/${streamerId}/vs`, {
          params: startDate ? { startDate, endDate } : {},
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setVsPositionStats(data ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setVsError("선택한 기간의 통계를 불러오지 못했습니다.");
          setVsPositionStats([]);
        }
      } finally {
        if (!controller.signal.aborted) setVsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [streamerId, startDate, endDate, retryCount]);

  const getWinRateColor = (rate) => {
        if (rate >= 70) return "#3bc9db";
        if (rate >= 60) return "#4dabf7";
        if (rate >= 55) return "#69db7c";
        if (rate >= 50) return "#adb5bd";
        if (rate >= 45) return "#fcc419";
        if (rate >= 40) return "#ff922b";
        return "#ff6b6b";
    };

  // 포지션별 총 전적 계산
  const positionSummaryStats = useMemo(() => {
    const base = POSITION_ORDER.map((pos) => ({
      ckPosition: pos,
      winCount: 0,
      loseCount: 0,
      totalCount: 0,
      winRate: 0,
    }));

    vsPositionStats.forEach((stat) => {
      const entry = base.find((item) => item.ckPosition === stat.ckPosition);
      if (entry) {
        entry.winCount += stat.winCount ?? 0;
        entry.loseCount += stat.loseCount ?? 0;
        entry.totalCount += stat.totalCount ?? 0;
      }
    });

    return base.map((item) => ({
      ...item,
      winRate: item.totalCount ? Number(((item.winCount / item.totalCount) * 100).toFixed(1)) : 0,
    }));
  }, [vsPositionStats]);

  const activePositionStats = useMemo(
    () => positionSummaryStats.filter((stat) => stat.totalCount > 0),
    [positionSummaryStats]
  );

  const totalPositionGames = useMemo(
    () => positionSummaryStats.reduce((sum, stat) => sum + stat.totalCount, 0),
    [positionSummaryStats]
  );

  const positionDoughnutData = useMemo(() => {
    if (totalPositionGames === 0) return null;

    return {
      labels: activePositionStats.map((stat) => stat.ckPosition),
      datasets: [
        {
          label: "포지션 비율",
          data: activePositionStats.map((stat) => stat.totalCount),
          backgroundColor: activePositionStats.map(
            (stat) => POSITION_CHART_COLORS[stat.ckPosition] ?? "#adb5bd"
          ),
          borderColor: "rgba(255,255,255,0.75)",
          borderWidth: 1,
          hoverBorderColor: "#ffffff",
          hoverBorderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [activePositionStats, totalPositionGames]);

  const positionDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      positionTotal: { total: totalPositionGames },
      positionLabelPlugin: {
        stats: activePositionStats,
        totalPositionGames,
      },
      legend: {
        position: "bottom",
        labels: {
          color: "#ccc",
          usePointStyle: true,
          padding: 12,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const stat = activePositionStats[context.dataIndex];
            const ratio = totalPositionGames > 0
              ? ((stat.totalCount / totalPositionGames) * 100).toFixed(1)
              : "0.0";

            return [
              `플레이 비율: ${ratio}%`,
              `총 ${stat.totalCount}경기`,
              `${stat.winCount}승 ${stat.loseCount}패`,
              `승률: ${stat.winRate}%`,
            ];
          },
        },
      },
    },
  };

  // 맞라인 상대별 전적 요약
  const vsSummaryStats = useMemo(() => {
    const map = {};

    vsPositionStats.forEach((stat) => {
      const key = stat.vsStreamerNo;
      if (!map[key]) {
        map[key] = {
          vsStreamerNo: stat.vsStreamerNo,
          vsStreamerName: stat.vsStreamerName ?? "-",
          winCount: 0,
          loseCount: 0,
          totalCount: 0,
        };
      }
      map[key].winCount += stat.winCount ?? 0;
      map[key].loseCount += stat.loseCount ?? 0;
      map[key].totalCount += stat.totalCount ?? 0;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        winRate: item.totalCount ? Number(((item.winCount / item.totalCount) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [vsPositionStats]);

  // 포지션별 vs 전적
  const expandedVsPositionStats = useMemo(
    () =>
      vsPositionStats
        .filter((stat) => stat.vsStreamerNo === expandedVsStreamerNo)
        .sort((a, b) => POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition)),
    [vsPositionStats, expandedVsStreamerNo]
  );


  // 연승, 연패
  const [streak, setStreak] = useState(null);
  useEffect(() => {
    if (!streamerId) return;
    const controller = new AbortController();
    const loadStreak = async () => {
      try {
        const { data } = await axios.get(`/ck/streak/${streamerId}`, {signal: controller.signal,});
        if (!controller.signal.aborted) {
          setStreak(data ?? null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("CK 연승 기록 조회 실패", error);
          setStreak(null);
        }
      }
    };
    
    loadStreak();
    console.log(streak);
    return () => controller.abort();
  }, [streamerId]);

    const getStreakClass = (result, count) => {
    if (!result || !count) return "";

    if (result === "W") {
      if (count >= 5) return "streak-win-high";
      if (count >= 3) return "streak-win-mid";
      return "streak-win-low";
    }

    if (result === "L") {
      if (count >= 5) return "streak-lose-high";
      if (count >= 3) return "streak-lose-mid";
      return "streak-lose-low";
    }

    return "";
  };

  //날짜 포맷
  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    const year = String(d.getFullYear()).slice(2);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  return (
    <>
      {/* 상단 CK 전적 제목 카드 */}
      <div className="row mt-3 mb-3">
        <div className="col">
          <div className="card bg-dark border-secondary text-white p-3">
            <div className="ck-summary-layout">

              {/* 왼쪽 제목 영역 */}
              <div className="ck-summary-intro">
                <h2 className="mb-1">CK 전적</h2>

                <p className="mb-0 text-secondary">
                  {streamer?.streamerName
                    ? `${streamer.streamerName}님의 CK 기록입니다.`
                    : "스트리머의 CK 기록입니다."}
                </p>

                <p className="small text-secondary mb-0">
                  {periodLabel}
                </p>
              </div>

              {/* 오른쪽 통계 영역 */}
              {vsLoading ? (
                <p role="status" className="mb-0">
                  통계를 불러오는 중입니다.
                </p>
              ) : vsError ? (
                <p className="text-secondary mb-0">
                  통계 조회 실패
                </p>
              ) : (
                <div className="ck-summary">

                  <div className="ck-summary-record">
                    {/* 전체 전적 */}
                    <div className="fs-5 fw-bold text-white mb-2">
                      {(() => {
                        const totalWins = positionSummaryStats.reduce((sum, stat) => sum + stat.winCount,0);
                        const totalLoses = positionSummaryStats.reduce((sum, stat) => sum + stat.loseCount,0);
                        return `${totalWins + totalLoses}전 ${totalWins}승 ${totalLoses}패`;
                      })()}
                    </div>

                    {/* 승률 게이지 */}
                    <div className="bg-white bg-opacity-10 rounded-pill" style={{height: "8px", marginBottom: "6px", }}>
                      {(() => {
                        const totalWins = positionSummaryStats.reduce((sum, stat) => sum + stat.winCount,0);
                        const totalLoses = positionSummaryStats.reduce((sum, stat) => sum + stat.loseCount, 0);
                        const totalGames = totalWins + totalLoses;
                        const totalWinRate = totalGames ? Number(((totalWins / totalGames) * 100).toFixed(1)): 0;
                        return (
                          <div className="rounded-pill"style={{width: `${totalWinRate}%`, height: "100%",backgroundColor: getWinRateColor(totalWinRate), }} />
                        );
                      })()}
                    </div>

                    {/* 승률 */}
                    <div className="text-secondary small">
                      {(() => {
                        const totalWins = positionSummaryStats.reduce((sum, stat) => sum + stat.winCount,0 );
                        const totalLoses = positionSummaryStats.reduce((sum, stat) => sum + stat.loseCount,0);
                        const totalGames = totalWins + totalLoses;
                        const totalWinRate = totalGames? Number(((totalWins / totalGames) * 100).toFixed(1)) : 0;

                        return totalGames? `승률 ${totalWinRate}%` : "선택한 기간의 전적 없음";
                      })()}
                    </div>
                  </div>

                  {/* 연승 / 연패 */}
                  {streak && (
                    <section className="ck-streak-area" aria-label="연승 및 연패 기록">
                      <div
                        className={`ck-current-streak ${getStreakClass(
                          streak.currentResult,
                          streak.currentStreak
                        )}`}
                      >
                        <div className="ck-current-streak-info">
                          <span className="ck-streak-current-label">
                            CURRENT STREAK
                          </span>

                          <span className="ck-streak-current-desc">
                            현재 CK 흐름
                          </span>
                        </div>

                        <strong className="ck-streak-current-value">
                          <span className="ck-streak-number">
                            {streak.currentStreak}
                          </span>
                          <span className="ck-streak-unit">
                            {streak.currentResult === "W" ? "연승" : "연패"}
                          </span>
                        </strong>
                      </div>

                      <div className="ck-streak-records">
                        <div className="ck-streak-record">
                          <span className="ck-streak-record-label">최고 연승</span>
                          <strong className="ck-streak-win-record">
                            {streak.maxWinStreak}연승
                            <span className="ms-1 ck-streak-date">
                              ({formatDate(streak.maxWinStart)}~{formatDate(streak.maxWinEnd)})
                          </span>
                          </strong>
                        </div>

                        <hr className="ck-streak-record-divider" />

                        <div className="ck-streak-record">
                          <span className="ck-streak-record-label">최다 연패</span>
                          <strong className="ck-streak-lose-record">
                            {streak.maxLoseStreak}연패
                            <span className="ms-1 ck-streak-date">
                              ({formatDate(streak.maxLoseStart)}~{formatDate(streak.maxLoseEnd)})
                            </span>
                          </strong>
                        </div>
                      </div>
                    </section>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 포지션별 총 전적 */}
      {!vsLoading && !vsError && (
      <div className="card bg-dark border-secondary text-white mb-3">
        <div className="card-header bg-white text-dark border-secondary">
          <h5 className="mb-0 fw-bold section-title">포지션별 총 전적</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-7">
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {positionSummaryStats.map((stat) => (
                  <div
                    key={stat.ckPosition}
                    className={`position-summary-card ${stat.totalCount === 0 ? "inactive" : ""}`}
                  >
                    <div className="position-summary-label">{stat.ckPosition}</div>
                    {stat.totalCount > 0 ? (
                      <>
                        <div className="position-summary-record">
                          <span className={`${stat.winCount == 0 ? "text-secondary" : "text-white"} fw-semibold fs-5`}>{stat.winCount}승</span>
                          <span className={`${stat.loseCount == 0 ? "text-secondary" : "text-danger"} fw-semibold fs-5`}>{stat.loseCount}패</span>
                        </div>
                        <div className="position-summary-bar bg-white bg-opacity-10 rounded-pill">
                          <div
                            className="position-summary-bar-fill rounded-pill"
                            style={{
                              width: `${stat.winRate}%`,
                              backgroundColor: getWinRateColor(stat.winRate),
                            }}
                          />
                        </div>
                        <div className="text-secondary small mt-1">승률 {stat.winRate}%</div>
                      </>
                    ) : (
                      <div className="position-summary-empty">전적 없음</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="position-doughnut-panel">
                <div className="position-doughnut-title">포지션 비율</div>
                {totalPositionGames > 0 && positionDoughnutData ? (
                  <div className="position-doughnut-chart">
                    <Doughnut data={positionDoughnutData} options={positionDoughnutOptions} plugins={POSITION_CHART_PLUGINS} role="img"
                      aria-label={`포지션 비율: ${activePositionStats.map((stat) => `${stat.ckPosition} ${((stat.totalCount / totalPositionGames) * 100).toFixed(1)}%`).join(", ")}`} />
                  </div>
                ) : (
                  <div className="position-doughnut-empty">포지션 전적이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 맞라인 상대별 전적 + CK 목록 섹션 */}
      <div className="row g-3">
        {/* 맞라인 상대별 전적 */}
        <div className="col-12 col-xl-4">
          <div className="card bg-dark border-secondary h-100">
            <div className="card-header bg-white border-secondary d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold section-title">맞라인 상대별 전적</h5>
            </div>
            <div className="card-body">
              {vsLoading && (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-light" role="status" />
                </div>
              )}

              {vsError && (
                <div className="alert alert-danger" role="alert">
                  {vsError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                    onClick={() => setRetryCount((value) => value + 1)}>다시 시도</button>
                </div>
              )}

              {!vsLoading && !vsError && vsSummaryStats.length === 0 && (
                <div className="text-center text-secondary py-4">
                  선택한 기간의 맞라인 상대 전적이 없습니다.
                </div>
              )}

              {!vsLoading && !vsError && vsSummaryStats.length > 0 && (
                <div className="list-group list-group-flush">
                  {vsSummaryStats.map((vs) => (
                    <div key={vs.vsStreamerNo} className="list-group-item bg-dark border-secondary text-white py-3 vs-item">
                      <div className="d-flex justify-content-between align-items-center gap-3">
                        <div className="min-w-0">
                          <div className="fw-semibold text-truncate vs-item-name">
                            <Link to={`/streamer/${vs.vsStreamerNo}`} className="fs-6 text-decoration-none text-white">
                              vs <span className="text-white fs-5">{vs.vsStreamerName}</span>
                              <span className="ms-3 text-secondary small vs-item-record mt-1">
                                {vs.totalCount}전 {vs.winCount}승 {vs.loseCount}패
                              </span>
                            </Link>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="fw-semibold mb-2 vs-item-rate me-3 fs-5">{vs.winRate}%</span>
                          <button type="button" className="btn btn-sm btn-outline-light"
                                onClick={() => setExpandedVsStreamerNo((current) =>
                                current === vs.vsStreamerNo ? null : vs.vsStreamerNo )}>
                            {expandedVsStreamerNo === vs.vsStreamerNo ? "접기" : "상세 전적"}
                          </button>
                        </div>
                      </div>
                      {/* VS 게이지바 */}
                      <div className="vs-item-bar bg-white bg-opacity-10 rounded-pill mt-3">
                        <div
                          className="vs-item-bar-fill rounded-pill"
                          style={{
                            width: `${vs.winRate}%`,
                            backgroundColor: getWinRateColor(vs.winRate),
                          }}
                        />
                      </div>
                      {/* 포지션별 vs전적 */}
                      {expandedVsStreamerNo === vs.vsStreamerNo && (
                        <div className="mt-3 ms-4">
                          {expandedVsPositionStats.length === 0 ? (
                            <div className="text-secondary small">포지션별 전적이 없습니다.</div>
                          ) : (
                            <div className="detail-list">
                              {expandedVsPositionStats.map((item) => (
                                <div className="detail-row rounded-3 p-2 mt-1"  key={`${item.vsStreamerNo}-${item.ckPosition}`} >
                                  <div className="d-flex align-items-center justify-content-between gap-3">
                                    <div className="min-w-0">
                                      <div className="text-white small fw-semibold">
                                        <span className="text-white small fw-semibold fs-5">
                                         {item.ckPosition}
                                        </span>
                                        <span className="ms-2 text-secondary smaller mt-1">
                                          {item.totalCount}전 : {item.winCount}승 {item.loseCount}패
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-white small fw-semibold fs-5">{item.winRate}%</div>
                                  </div>
                                  <div className="detail-bar bg-white bg-opacity-10 rounded-pill mt-2">
                                    <div
                                      className="detail-bar-fill rounded-pill"
                                      style={{
                                        width: `${item.winRate}%`,
                                        backgroundColor: getWinRateColor(item.winRate),
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 전체 CK 전적 목록 (분리된 컴포넌트) */}
        <div className="col-12 col-xl-8">
          <StreamerCkListSection streamerId={streamerId} streamerName={streamer?.streamerName}
            startDate={startDate} endDate={endDate} periodLabel={periodLabel} />
        </div>
      </div>
    </>
  );
}
