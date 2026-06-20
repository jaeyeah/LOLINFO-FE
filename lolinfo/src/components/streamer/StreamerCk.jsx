import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import StreamerCkListSection from "./StreamerCkListSection";

const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];

export default function StreamerCk() {
  const { streamer, streamerId } = useOutletContext();

  // 맞라인 상대 전적 관련 상태 (CK 목록과 독립적)
  const [vsPositionStats, setVsPositionStats] = useState([]);
  const [vsLoading, setVsLoading] = useState(false);
  const [vsError, setVsError] = useState(null);
  const [expandedVsStreamerNo, setExpandedVsStreamerNo] = useState(null);

  // 맞라인 상대 전적 API 호출 (streamerId가 바뀔 때만)
  const loadVsStats = useCallback(async () => {
    try {
      setVsLoading(true);
      setVsError(null);
      const { data } = await axios.get(`/ck/${streamerId}/vs`);
      setVsPositionStats(data ?? []);
    } catch (err) {
      console.error("맞라인 전적 로드 실패", err);
      setVsError("맞라인 전적을 불러오지 못했습니다.");
      setVsPositionStats([]);
    } finally {
      setVsLoading(false);
    }
  }, [streamerId]);

  // streamerId 변경 시 상태 초기화
  useEffect(() => {
    setVsPositionStats([]);
    setVsLoading(false);
    setVsError(null);
    setExpandedVsStreamerNo(null);
  }, [streamerId]);

  // 맞라인 전적 로드
  useEffect(() => {
    loadVsStats();
  }, [loadVsStats]);

  const getWinRateColor = (rate) => {
    if (rate >= 70) return "#2ecc71";
    if (rate >= 55) return "#4dabf7";
    if (rate >= 45) return "#f6c23e";
    return "#e74c3c";
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

  return (
    <>
      {/* 상단 CK 전적 제목 카드 */}
      <div className="row mt-3 mb-3">
        <div className="col">
          <div className="card bg-dark border-secondary text-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">CK 전적</h2>
                <p className="mb-0 text-secondary">
                  {streamer?.streamerName ? `${streamer.streamerName}님의 CK 기록입니다.` : "스트리머의 CK 기록입니다."}
                </p>
              </div>
              <div className="text-end" style={{ minWidth: "150px" }}>
                <div className="fs-5 fw-bold text-white mb-2">
                  {(() => {
                    const totalWins = positionSummaryStats.reduce((sum, stat) => sum + stat.winCount, 0);
                    const totalLoses = positionSummaryStats.reduce((sum, stat) => sum + stat.loseCount, 0);
                    return `${totalWins}승 ${totalLoses}패`;
                  })()}
                </div>
                <div className="bg-white bg-opacity-10 rounded-pill" style={{ height: "8px", marginBottom: "6px" }}>
                  {(() => {
                    const totalWins = positionSummaryStats.reduce((sum, stat) => sum + stat.winCount, 0);
                    const totalLoses = positionSummaryStats.reduce((sum, stat) => sum + stat.loseCount, 0);
                    const totalGames = totalWins + totalLoses;
                    const totalWinRate = totalGames ? Number(((totalWins / totalGames) * 100).toFixed(1)) : 0;
                    return (
                      <div
                        className="rounded-pill"
                        style={{
                          width: `${totalWinRate}%`,
                          height: "100%",
                          backgroundColor: getWinRateColor(totalWinRate),
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="text-secondary small">
                  {(() => {
                    const totalWins = positionSummaryStats.reduce((sum, stat) => sum + stat.winCount, 0);
                    const totalLoses = positionSummaryStats.reduce((sum, stat) => sum + stat.loseCount, 0);
                    const totalGames = totalWins + totalLoses;
                    const totalWinRate = totalGames ? Number(((totalWins / totalGames) * 100).toFixed(1)) : 0;
                    return `승률 ${totalWinRate}%`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 포지션별 총 전적 */}
      <div className="card bg-dark border-secondary text-white mb-3">
        <div className="card-header bg-white text-dark border-secondary">
          <h5 className="mb-0 fw-bold section-title">포지션별 총 전적</h5>
        </div>
        <div className="card-body">
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
      </div>

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
                </div>
              )}

              {!vsLoading && !vsError && vsSummaryStats.length === 0 && (
                <div className="text-center text-secondary py-4">
                  맞라인 상대 전적이 없습니다.
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
          <StreamerCkListSection streamerId={streamerId} />
        </div>
      </div>
    </>
  );
}
