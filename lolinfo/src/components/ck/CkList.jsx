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
        console.log("참가자 정보 로드 성공", { ckId, data, winner });
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
    },[] );

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
                      {POSITION_ORDER.map((position) => {
                        const redParticipant = redTeam.find((p) => p.ckPosition === position);
                        const blueParticipant = blueTeam.find((p) => p.ckPosition === position);
                        const redWin = selectedWinner === "red";
                        const blueWin = selectedWinner === "blue";

                        return (
                          <div key={position} className="col-12">
                            <div className="row gx-2 gy-2 align-items-center">
                              <div className="col-12 col-md-5">
                                <div className={`card h-100 border ${redWin ? "border-danger bg-danger bg-opacity-10" : "border-secondary bg-dark"}`}>
                                  <div className="card-body py-3 px-3">
                                    {redParticipant ? (
                                      <Link
                                        to={`/streamer/${redParticipant.ckStreamer}`}
                                        className="text-white text-decoration-none d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start gap-3 text-center text-md-start flex-wrap"
                                      >
                                        <div className="flex-fill">
                                          <div className="fw-bold text-white mb-1 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                                            {redParticipant.streamerName}
                                            {redWin && <span className="badge bg-danger">승리</span>}
                                          </div>
                                        </div>
                                        <div>
                                          <img
                                            src={buildProfileUrl(redParticipant.streamerSoopId)}
                                            alt={redParticipant.streamerName}
                                            className="rounded-circle border border-danger"
                                            style={{ width: 48, height: 48, objectFit: "cover" }}
                                          />
                                        </div>
                                        <div>
                                          <span className="badge rounded-pill bg-danger bg-opacity-75 px-3 py-2">
                                            {position}
                                          </span>
                                        </div>
                                      </Link>
                                    ) : (
                                      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start gap-3 text-center text-md-start flex-wrap">
                                        <div className="flex-fill">
                                          <div className="fw-bold text-white mb-1">참가 없음</div>
                                        </div>
                                        <div className="rounded-circle border border-danger bg-secondary bg-opacity-25" style={{ width: 48, height: 48 }} />
                                        <div>
                                          <span className="badge rounded-pill bg-danger bg-opacity-75 px-3 py-2">
                                            {position}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-2 d-flex align-items-center justify-content-center">
                                <div className="badge rounded-pill bg-white bg-opacity-10 text-white fs-5 py-2 px-3">
                                  VS
                                </div>
                              </div>

                              <div className="col-12 col-md-5">
                                <div className={`card h-100 border ${blueWin ? "border-primary bg-primary bg-opacity-10" : "border-secondary bg-dark"}`}>
                                  <div className="card-body py-3 px-3">
                                    {blueParticipant ? (
                                      <Link
                                        to={`/streamer/${blueParticipant.ckStreamer}`}
                                        className="text-white text-decoration-none d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-end gap-3 text-center text-md-end flex-wrap"
                                      >
                                        <div>
                                          <span className="badge rounded-pill bg-primary bg-opacity-75 px-3 py-2">
                                            {position}
                                          </span>
                                        </div>
                                        <div>
                                          <img
                                            src={buildProfileUrl(blueParticipant.streamerSoopId)}
                                            alt={blueParticipant.streamerName}
                                            className="rounded-circle border border-primary"
                                            style={{ width: 48, height: 48, objectFit: "cover" }}
                                          />
                                        </div>
                                        <div className="flex-fill">
                                          <div className="fw-bold text-white mb-1 d-flex align-items-center gap-2 justify-content-center justify-content-md-end">
                                            {blueParticipant.streamerName}
                                            {blueWin && <span className="badge bg-primary">승리</span>}
                                          </div>
                                        </div>
                                      </Link>
                                    ) : (
                                      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-end gap-3 text-center text-md-end flex-wrap">
                                        <div>
                                          <span className="badge rounded-pill bg-primary bg-opacity-75 px-3 py-2">
                                            {position}
                                          </span>
                                        </div>
                                        <div className="rounded-circle border border-primary bg-secondary bg-opacity-25" style={{ width: 48, height: 48 }} />
                                        <div className="flex-fill">
                                          <div className="fw-bold text-white mb-1">참가 없음</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
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
