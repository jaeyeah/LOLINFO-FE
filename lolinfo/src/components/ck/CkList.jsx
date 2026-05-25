import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import { buildProfileUrl } from "../../utils/profileUrl";

const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];

export default function CkList() {
  const [ckList, setCkList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({
    page: 1,
    size: 10,
    totalCount: 0,
    totalPage: 0,
    blockStart: 1,
    blockFinish: 1,
    prev: false,
    next: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCkId, setSelectedCkId] = useState(null);
  const [participantCache, setParticipantCache] = useState({});
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantError, setParticipantError] = useState(null);

  const loadCkList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("/ck/", { params: { page } });
      setCkList(data.list ?? []);
      setPageData(data.pageVO ?? {
        page,
        size: 10,
        totalCount: 0,
        totalPage: 0,
        blockStart: 1,
        blockFinish: 1,
        prev: false,
        next: false,
      });
    } catch (err) {
      console.error("CK 목록 로드 실패", err);
      setError("CK 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchParticipants = useCallback(
    async (ckId) => {
      if (!ckId) return;
      if (participantCache[ckId]) return;

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
        console.error("CK 참가자 정보 로드 실패", err);
        setParticipantError("팀원 정보를 불러올 수 없습니다.");
      } finally {
        setParticipantLoading(false);
      }
    },
    [participantCache]
  );

  useEffect(() => {
    loadCkList();
  }, [loadCkList]);

  useEffect(() => {
    if (selectedCkId !== null) {
      fetchParticipants(selectedCkId);
    }
  }, [selectedCkId, fetchParticipants]);

  const openParticipantModal = useCallback(
    (ckId) => {
      setParticipantError(null);
      setSelectedCkId(ckId);
    },
    []
  );

  const closeModal = useCallback(() => {
    setSelectedCkId(null);
    setParticipantError(null);
  }, []);

  const selectedCk = useMemo(
    () => ckList.find((ck) => ck.ckId === selectedCkId) ?? null,
    [ckList, selectedCkId]
  );

  const selectedParticipantData = selectedCkId ? participantCache[selectedCkId]?.participants ?? [] : [];
  const selectedWinner = selectedCkId ? participantCache[selectedCkId]?.winner : null;

  const redTeam = useMemo(
    () =>
      selectedParticipantData
        .filter((p) => p.ckSide === "red")
        .sort((a, b) => POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition)),
    [selectedParticipantData]
  );

  const blueTeam = useMemo(
    () =>
      selectedParticipantData
        .filter((p) => p.ckSide === "blue")
        .sort((a, b) => POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition)),
    [selectedParticipantData]
  );

  const formatDate = (value) => {
    if (!value) return "날짜 없음";
    try {
      return new Date(value).toISOString().split("T")[0];
    } catch {
      return "날짜 없음";
    }
  };

  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <div className="card bg-dark border-secondary text-white p-3">
            <h2 className="mb-1">CK 전체 목록</h2>
            <p className="mb-0 text-secondary">
              CK 목록은 최소 데이터만 조회하며 팀원 상세 정보는 별도 API로 분리됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12">
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-light" role="status" />
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && ckList.length === 0 && (
            <div className="card bg-dark border-secondary text-white p-4 text-center">
              등록된 CK가 없습니다.
            </div>
          )}

          {!loading && !error && ckList.length > 0 && (
            <div className="card bg-dark border-secondary text-white mb-3">
              <div className="table-responsive">
                <table className="table table-dark table-striped mb-0 align-middle">
                  <thead className="text-center table-secondary text-dark ">
                    <tr>
                      <th scope="col">CK 날짜</th>
                      <th scope="col">CK 메모</th>
                      <th scope="col">팀원</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ckList.map((ck) => (
                      <tr key={ck.ckId} className="border-secondary text-center">
                        <td>{formatDate(ck.ckDate)}</td>
                        <td>{ck.ckMemo || "-"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-light"
                            onClick={() => openParticipantModal(ck.ckId)}
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
          )}

          {selectedCkId !== null && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 }}
              onClick={closeModal}
            >
              <div
                className="card bg-dark border-secondary text-white w-100 mx-3"
                style={{ maxWidth: 960 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">CK 팀원 정보</h5>
                    <div className="text-secondary">
                      {selectedCk ? `${formatDate(selectedCk.ckDate)} ${selectedCk.ckMemo || ""}` : ""}
                    </div>
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

                  {!participantLoading && !participantError && selectedParticipantData.length === 0 && (
                    <div className="text-white text-center py-4">참여 인원이 없습니다.</div>
                  )}

                  {!participantLoading && !participantError && selectedParticipantData.length > 0 && (
                    <div className="row gy-3">
                      <div className="col-md-6">
                        <div className="card bg-dark border-danger h-100">
                          <div className="card-header d-flex align-items-center justify-content-between">
                            <span className="text-white">RED 팀</span>
                            {selectedWinner === "red" && <span className="badge bg-danger">승리</span>}
                          </div>
                          <div className="card-body">
                            {redTeam.map((participant) => (
                              <div key={participant.ckStreamer + participant.ckPosition} className="mb-3 d-flex align-items-center gap-3">
                                <Link to={`/streamer/${participant.ckStreamer}`} className="d-inline-block">
                                  <img
                                    src={buildProfileUrl(participant.streamerSoopId)}
                                    alt={participant.streamerName}
                                    className="rounded-circle border border-light"
                                    style={{ width: 48, height: 48, objectFit: "cover" }}
                                  />
                                </Link>
                                <div>
                                  <div className="text-white fw-bold">{participant.ckPosition}</div>
                                  <Link to={`/streamer/${participant.ckStreamer}`} className="text-white text-decoration-none fw-bold">
                                    {participant.streamerName}
                                  </Link>
                                  <div className="text-secondary small">@{participant.streamerSoopId}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card bg-dark border-primary h-100">
                          <div className="card-header d-flex align-items-center justify-content-between">
                            <span className="text-white">BLUE 팀</span>
                            {selectedWinner === "blue" && <span className="badge bg-primary">승리</span>}
                          </div>
                          <div className="card-body">
                            {blueTeam.map((participant) => (
                              <div key={participant.ckStreamer + participant.ckPosition} className="mb-3 d-flex align-items-center gap-3">
                                <Link to={`/streamer/${participant.ckStreamer}`} className="d-inline-block">
                                  <img
                                    src={buildProfileUrl(participant.streamerSoopId)}
                                    alt={participant.streamerName}
                                    className="rounded-circle border border-light"
                                    style={{ width: 48, height: 48, objectFit: "cover" }}
                                  />
                                </Link>
                                <div>
                                  <div className="text-white fw-bold">{participant.ckPosition}</div>
                                  <Link to={`/streamer/${participant.ckStreamer}`} className="text-white text-decoration-none fw-bold">
                                    {participant.streamerName}
                                  </Link>
                                  <div className="text-secondary small">@{participant.streamerSoopId}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="row mt-2">
              <div className="col-12 d-flex flex-column align-items-center gap-2">
                <div className="text-white">
                  현재 페이지: <strong>{pageData.page}</strong> / 전체 페이지: <strong>{pageData.totalPage}</strong>
                </div>
                <Pagination
                  page={page}
                  totalPage={pageData.totalPage}
                  blockStart={pageData.blockStart}
                  blockFinish={pageData.blockFinish}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
