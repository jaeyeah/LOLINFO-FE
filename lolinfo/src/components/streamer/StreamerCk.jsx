import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import Pagination from "../Pagination";
import { buildProfileUrl } from "../../utils/profileUrl";

const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];
const RESULT_STYLE = {
  승리: "bg-primary text-white",
  패배: "bg-danger text-white",
};

export default function StreamerCk() {
  const { streamerId } = useParams();
  const { streamer } = useOutletContext() ?? {};

  const [ckList, setCkList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [pageVO, setPageVO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCkId, setSelectedCkId] = useState(null);
  const [participantCache, setParticipantCache] = useState({});
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantError, setParticipantError] = useState(null);
  const [vsPositionStats, setVsPositionStats] = useState([]);
  const [vsLoading, setVsLoading] = useState(false);
  const [vsError, setVsError] = useState(null);
  const [expandedVsStreamerNo, setExpandedVsStreamerNo] = useState(null);

  const myStreamerId = Number(streamerId);
  const loadCkList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/ck/streamer/${streamerId}`, {
        params: { page },
      });
      //console.log("CK 목록 로드 성공", data);
      setCkList(data.list ?? []);
      setPageVO(data.pageVO ?? null);
      setPage(data.pageVO?.page ?? data.page ?? page);
      setTotalPage(data.pageVO?.totalPage ?? data.totalPage ?? 1);
    } catch (err) {
      //console.error("CK 목록 로드 실패", err);
      setError("CK 목록을 불러오지 못했습니다.");
      setCkList([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  }, [page, streamerId]);

  useEffect(() => {
    setPage(1);
    setSelectedCkId(null);
    setParticipantCache({});
    setParticipantError(null);
    setVsPositionStats([]);
    setVsLoading(false);
    setVsError(null);
    setExpandedVsStreamerNo(null);
  }, [streamerId]);

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

  useEffect(() => {
    loadCkList();
  }, [loadCkList]);

  useEffect(() => {
    loadVsStats();
  }, [loadVsStats]);

  const fetchParticipants = useCallback(
    async (ckId) => {
      if (!ckId || participantCache[ckId]) return;

      try {
        setParticipantLoading(true);
        setParticipantError(null);
        const { data } = await axios.get(`/ck/${ckId}/participant`);
        const winner = data[0]?.ckWinner ?? null;
        setParticipantCache((prev) => ({
          ...prev,
          [ckId]: {
            participants: data,
            winner,
          },
        }));
      } catch (err) {
        //console.error("CK 참가자 로드 실패", err);
        setParticipantError("팀원 정보를 불러올 수 없습니다.");
      } finally {
        setParticipantLoading(false);
      }
    },
    [participantCache]
  );

  useEffect(() => {
    if (selectedCkId !== null) {
      fetchParticipants(selectedCkId);
    }
  }, [selectedCkId, fetchParticipants]);

  const selectedCk = useMemo(
    () => ckList.find((ck) => ck.ckId === selectedCkId) ?? null,
    [ckList, selectedCkId]
  );

  const selectedParticipants = useMemo(
    () => participantCache[selectedCkId]?.participants ?? [],
    [participantCache, selectedCkId]
  );

  const selectedWinner = useMemo(
    () => participantCache[selectedCkId]?.winner ?? null,
    [participantCache, selectedCkId]
  );

  const loadedParticipants = selectedCkId !== null && Object.prototype.hasOwnProperty.call(participantCache, selectedCkId);

  const sortByPosition = (a, b) =>
    POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition);

  const getWinRateColor = (rate) => {
    if (rate >= 70) return "#2ecc71";
    if (rate >= 55) return "#4dabf7";
    if (rate >= 45) return "#f6c23e";
    return "#e74c3c";
  };

  const redTeam = useMemo(
    () =>
      selectedParticipants
        .filter((p) => p.ckSide === "red")
        .sort(sortByPosition),
    [selectedParticipants]
  );

  const blueTeam = useMemo(
    () =>
      selectedParticipants
        .filter((p) => p.ckSide === "blue")
        .sort(sortByPosition),
    [selectedParticipants]
  );

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

  const expandedVsPositionStats = useMemo(
    () =>
      vsPositionStats
        .filter((stat) => stat.vsStreamerNo === expandedVsStreamerNo)
        .sort((a, b) => POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition)),
    [vsPositionStats, expandedVsStreamerNo]
  );

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  const getStatusClass = (result) => RESULT_STYLE[result] || "bg-secondary text-white";

  const openModal = (ckId) => {
    setSelectedCkId((current) => (current === ckId ? null : ckId));
    setParticipantError(null);
  };

  const closeModal = () => {
    setSelectedCkId(null);
    setParticipantError(null);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPage) return;
    setPage(nextPage);
    setSelectedCkId(null);
  };

  const blockStart = pageVO?.blockStart ?? 1;
  const blockFinish = pageVO?.blockFinish ?? 1;

  const showMainContent = !loading && !error;
  const hasCkRecords = ckList.length > 0;

  return (
    <>
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

      {loading && (
        <div className="card bg-dark border-secondary text-white mb-3 p-4">
          <div className="placeholder-glow">
            <span className="placeholder col-6 mb-3"></span>
            <span className="placeholder col-4 mb-3"></span>
            <div className="row g-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="col-12">
                  <div className="placeholder-glow card bg-dark border-secondary p-3">
                    <span className="placeholder col-12 mb-2"></span>
                    <span className="placeholder col-8"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {showMainContent && (
        <>
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


          {/* 맞라인 상대 전적 */}
          <div className="row g-3">
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

                  {/* 맞라인 상대전적 파트 */}
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

            {/* 전체 CK 전적 */}
            <div className="col-12 col-xl-8">
              {hasCkRecords ? (
                <>
                  <div className="card bg-dark border-secondary mb-3 d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-dark table-hover mb-0 align-middle">
                        <thead className="table-secondary text-dark text-center">
                          <tr>
                            <th scope="col">날짜</th>
                            <th scope="col">결과</th>
                            <th scope="col">맞라인 상대</th>
                            <th scope="col">메모</th>
                            <th scope="col"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {ckList.map((ck) => (
                            <tr key={ck.ckId}>
                              <td className="text-center">{formatDate(ck.ckDate)}</td>
                              <td className="text-center">
                                <span className={`badge ${getStatusClass(ck.ckResult)}`}>
                                  {ck.ckResult || "-"}
                                </span>
                              </td>
                              <td className="text-center">
                                {ck.vsStreamerNo ? (
                                  <Link to={`/streamer/${ck.vsStreamerNo}`} className="text-decoration-none text-white">
                                    {ck.vsStreamerName || "-"}
                                  </Link>
                                ) : (
                                  ck.vsStreamerName || "-"
                                )}
                              </td>
                              <td className="text-center">{ck.ckMemo || "-"}</td>
                              <td className="text-center">
                                <button type="button" className="btn btn-sm btn-outline-light"
                                  onClick={() => openModal(ck.ckId)}>
                                  팀원 보기
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-block d-md-none">
                    <div className="row g-3">
                      {ckList.map((ck) => (
                        <div key={ck.ckId} className="col-12">
                          <div className="card bg-dark border-secondary">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <div className="text-secondary small">{formatDate(ck.ckDate)}</div>
                                  <div className="h6 mb-1">
                                    vs {ck.vsStreamerNo ? (
                                      <Link to={`/streamer/${ck.vsStreamerNo}`} className="text-decoration-none text-white">
                                        {ck.vsStreamerName || "-"}
                                      </Link>
                                    ) : (
                                      ck.vsStreamerName || "-"
                                    )}
                                  </div>
                                </div>
                                <span className={`badge ${getStatusClass(ck.ckResult)}`}>
                                  {ck.ckResult || "-"}
                                </span>
                              </div>
                              <p className="text-secondary small mb-3">메모: {ck.ckMemo || "없음"}</p>
                              <button type="button" className="btn btn-sm btn-outline-light w-100"
                                onClick={() => openModal(ck.ckId)}>
                                팀원 보기
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mt-4">
                    <Pagination
                      page={page}
                      totalPage={totalPage}
                      blockStart={blockStart}
                      blockFinish={blockFinish}
                      onPageChange={handlePageChange}
                    />
                    <div className="text-secondary small">
                      페이지 {page} / {totalPage}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card bg-dark border-secondary text-white">
                  <div className="card-body text-center text-secondary py-4">
                    참여한 CK가 없습니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {selectedCk && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-md-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 }}
          onClick={closeModal}
        >
          <div
            className="card bg-dark border-secondary text-white w-100 mx-3"
            style={{ maxWidth: 960, maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 border-bottom border-secondary">
              <div>
                <h5 className="mb-1">{formatDate(selectedCk.ckDate)}</h5>
                <div className="text-secondary">{selectedCk.ckMemo || "메모 없음"}</div>
              </div>
              <button className="btn btn-sm btn-outline-light" onClick={closeModal}>
                닫기
              </button>
            </div>
            <div className="card-body ck-modal-body-scroll">
              {participantLoading && (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-light" role="status" />
                </div>
              )}

              {participantError && (
                <div className="alert alert-danger" role="alert">
                  {participantError}
                </div>
              )}

              {!participantLoading && !participantError && !loadedParticipants && (
                <div className="text-center text-secondary py-4">
                  팀원 정보를 불러오는 중입니다.
                </div>
              )}

              {!participantLoading && !participantError && loadedParticipants && selectedParticipants.length === 0 && (
                <div className="text-center text-secondary py-4">
                  참여한 팀원이 없습니다.
                </div>
              )}

              {!participantLoading && !participantError && selectedParticipants.length > 0 && (
                <div className="d-grid gap-2">
                  {POSITION_ORDER.map((position) => {
                    const redParticipant = redTeam.find((p) => p.ckPosition === position);
                    const blueParticipant = blueTeam.find((p) => p.ckPosition === position);
                    const redWin = selectedWinner === "red";
                    const blueWin = selectedWinner === "blue";

                    return (
                      <div key={position} className="ck-participant-line">
                        <div className="ck-participant-slot justify-content-end">
                          {redParticipant ? (
                            <Link
                              to={`/streamer/${redParticipant.ckStreamer}`}
                              className={`ck-participant-card red ${redWin ? "win" : ""} text-white text-decoration-none justify-content-end`}
                            >
                              <div className="ck-participant-info text-end">
                                <div className="ck-participant-name">{redParticipant.streamerName || "-"}</div>
                                <div className="ck-participant-meta">{redParticipant.ckPosition || position}</div>
                              </div>
                              <img
                                src={buildProfileUrl(redParticipant.streamerSoopId)}
                                alt={redParticipant.streamerName || "Red 팀원"}
                                className="ck-participant-avatar"
                              />
                            </Link>
                          ) : (
                            <div className="ck-participant-card none justify-content-center">참가 없음</div>
                          )}
                        </div>

                        <div className="ck-participant-vs">
                          <span className="badge bg-secondary text-white">VS</span>
                        </div>

                        <div className="ck-participant-slot justify-content-start">
                          {blueParticipant ? (
                            <Link
                              to={`/streamer/${blueParticipant.ckStreamer}`}
                              className={`ck-participant-card blue ${blueWin ? "win" : ""} text-white text-decoration-none justify-content-start`}
                            >
                              <img src={buildProfileUrl(blueParticipant.streamerSoopId)} alt={blueParticipant.streamerName || "Blue 팀원"}
                                className="ck-participant-avatar" />
                              <div className="ck-participant-info text-start">
                                <div className="ck-participant-name">{blueParticipant.streamerName || "-"}</div>
                                <div className="ck-participant-meta">{blueParticipant.ckPosition || position}</div>
                              </div>
                            </Link>
                          ) : (
                            <div className="ck-participant-card none justify-content-center">참가 없음</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
