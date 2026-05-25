import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import Pagination from "../Pagination";

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
  }, [streamerId]);

  useEffect(() => {
    loadCkList();
  }, [loadCkList]);

  const fetchParticipants = useCallback(
    async (ckId) => {
      if (!ckId || participantCache[ckId]) return;

      try {
        setParticipantLoading(true);
        setParticipantError(null);
        const { data } = await axios.get(`/ck/${ckId}/participant`);
        setParticipantCache((prev) => ({
          ...prev,
          [ckId]: data,
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
    () => participantCache[selectedCkId] ?? [],
    [participantCache, selectedCkId]
  );

  const loadedParticipants = selectedCkId !== null && Object.prototype.hasOwnProperty.call(participantCache, selectedCkId);

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  const sortByPosition = (a, b) =>
    POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition);

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

  const hasData = !loading && !error && ckList.length > 0;

  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <div className="card bg-dark border-secondary text-white p-3">
            <h2 className="mb-1">CK 전적</h2>
            <p className="mb-0 text-secondary">
              {streamer?.streamerName ? `${streamer.streamerName}님의 CK 기록입니다.` : "스트리머의 CK 기록입니다."}
            </p>
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

      {!loading && !error && ckList.length === 0 && (
        <div className="alert alert-info" role="alert">
          참여한 CK가 없습니다.
        </div>
      )}

      {hasData && (
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
                      <td>{formatDate(ck.ckDate)}</td>
                      <td className="text-center">
                        <span className={`badge ${getStatusClass(ck.ckResult)}`}>
                          {ck.ckResult || "-"}
                        </span>
                      </td>
                      <td>
                        {ck.vsStreamerNo ? (
                          <Link to={`/streamer/${ck.vsStreamerNo}`} className="text-decoration-none text-white">
                            {ck.vsStreamerName || "-"}
                          </Link>
                        ) : (
                          ck.vsStreamerName || "-"
                        )}
                      </td>
                      <td>{ck.ckMemo || "-"}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={() => openModal(ck.ckId)}
                        >
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
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light w-100"
                        onClick={() => openModal(ck.ckId)}
                      >
                        팀원 보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-4">
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
      )}

      {selectedCk && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-md-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 }}
          onClick={closeModal}
        >
          <div
            className="card bg-dark border-secondary text-white w-100 mx-3"
            style={{ maxWidth: 960, maxHeight: "90vh", overflowY: "auto" }}
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
            <div className="card-body">
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
                <div className="row g-3">
                  {['red', 'blue'].map((side) => {
                    const team = selectedParticipants
                      .filter((p) => p.ckSide === side)
                      .sort(sortByPosition);
                    return (
                      <div key={side} className="col-12 col-md-6">
                        <div className={`p-3 rounded-3 border ${side === 'red' ? 'border-danger' : 'border-primary'}`}>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className={side === 'red' ? 'text-danger fw-semibold' : 'text-primary fw-semibold'}>
                              {side === 'red' ? 'RED 팀' : 'BLUE 팀'}
                            </span>
                            {selectedCk.ckWinner === side && (
                              <span className={`badge ${side === 'red' ? 'bg-danger' : 'bg-primary'}`}>승리</span>
                            )}
                          </div>
                          {team.map((participant) => (
                            <div
                              key={participant.ckParticipantId ?? participant.ckStreamer}
                              className={`d-flex justify-content-between align-items-center py-2 border-bottom border-secondary ${
                                participant.ckStreamer === myStreamerId ? 'fw-bold text-warning' : ''
                              }`}
                            >
                              <div>
                                <span className="badge bg-secondary text-white me-2">{participant.ckPosition}</span>
                                {participant.streamerName}
                              </div>
                            </div>
                          ))}
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
