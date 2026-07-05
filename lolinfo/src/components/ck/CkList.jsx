import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../Pagination";
import { buildProfileUrl } from "../../utils/profileUrl";
import { adminState, loginState } from "../../utils/jotai";
import { useAtomValue } from "jotai";
import { FaEdit } from "react-icons/fa";

const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];

export default function CkList() {

  const isAdmin = useAtomValue(adminState);
  const isLogin = useAtomValue(loginState);

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

  // CK 항목 부분 수정 상태
  const [editingDateId, setEditingDateId] = useState(null);
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editingWinnerId, setEditingWinnerId] = useState(null);
  const [editDateValue, setEditDateValue] = useState("");
  const [editMemoValue, setEditMemoValue] = useState("");
  const [editWinnerValue, setEditWinnerValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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
        //console.log("참가자 정보 로드 성공", { ckId, data, winner });
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

  // 날짜 수정
  const handleEditDate = useCallback((ck) => {
    setEditingDateId(ck.ckId);
    setEditDateValue(ck.ckDate ? new Date(ck.ckDate).toISOString().slice(0, 10) : "");
  }, []);

  const handleCancelDate = useCallback(() => {
    setEditingDateId(null);
    setEditDateValue("");
  }, []);

  const handleSaveDate = useCallback(async (ckId) => {
    if (!editDateValue) {
      alert("변경할 날짜를 입력해주세요.");
      return;
    }

    try {
      setIsUpdating(true);
      const { data } = await axios.patch(`/ck/${ckId}`, { ckDate: editDateValue });
      setCkList((prev) =>
        prev.map((ck) => (ck.ckId === ckId ? { ...ck, ckDate: data.ckDate ?? editDateValue } : ck))
      );
      setEditingDateId(null);
      setEditDateValue("");
    } catch (err) {
      console.error("CK 날짜 수정 실패", err);
      alert("CK 날짜를 수정하지 못했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }, [editDateValue]);

  //메모(어떤 ck인지) 수정
  const handleEditMemo = useCallback((ck) => {
    setEditingMemoId(ck.ckId);
    setEditMemoValue(ck.ckMemo ?? "");
  }, []);

  const handleCancelMemo = useCallback(() => {
    setEditingMemoId(null);
    setEditMemoValue("");
  }, []);

  const handleSaveMemo = useCallback(async (ckId) => {
    if (!editMemoValue.trim()) {
      alert("메모를 입력해주세요.");
      return;
    }

    try {
      setIsUpdating(true);
      const { data } = await axios.patch(`/ck/${ckId}`, { ckMemo: editMemoValue });
      setCkList((prev) =>
        prev.map((ck) => (ck.ckId === ckId ? { ...ck, ckMemo: data.ckMemo ?? editMemoValue } : ck))
      );
      setEditingMemoId(null);
      setEditMemoValue("");
    } catch (err) {
      console.error("CK 메모 수정 실패", err);
      alert("CK 메모를 수정하지 못했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }, [editMemoValue]);

  //승리팀 수정
  const handleEditWinner = useCallback((ck) => {
    setEditingWinnerId(ck.ckId);
    setEditWinnerValue(ck.ckWinner ?? "");
  }, []);

  const handleCancelWinner = useCallback(() => {
    setEditingWinnerId(null);
    setEditWinnerValue("");
  }, []);

  const handleSaveWinner = useCallback(async (ckId) => {
    if (!editWinnerValue) {
      alert("승리팀을 선택해주세요.");
      return;
    }

    try {
      setIsUpdating(true);

      const { data } = await axios.patch(`/ck/${ckId}`, {
        ckWinner: editWinnerValue,
      });

      setCkList((prev) =>
        prev.map((ck) =>
          ck.ckId === ckId
            ? { ...ck, ckWinner: data.ckWinner ?? editWinnerValue }
            : ck
        )
      );

      setParticipantCache((prev) => {
        if (!prev[ckId]) return prev;
        return {
          ...prev,
          [ckId]: {
            ...prev[ckId],
            winner: editWinnerValue,
          },
        };
      });

      setEditingWinnerId(null);
      setEditWinnerValue("");
    } catch (err) {
      console.error("CK 결과 수정 실패", err);
      alert("CK 결과를 수정하지 못했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }, [editWinnerValue]);


  //모달
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

  // CK 삭제
      const deleteCk = useCallback(async(ckId)=>{
        try{
            await axios.delete(`/ck/${ckId}`);
            loadCkList();
            console.log("CK 삭제 실행");
        }catch (err) {
            console.error("CK 삭제 실패", err);
        }
    })




  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <div className="card bg-dark border-secondary text-white p-3">
            <h2 className="mb-1">CK 전체 목록</h2>
            <p className="mb-0 text-secondary">
              CK 목록은 최소 데이터만 조회하며 팀원 상세 정보는 별도 API로 분리됩니다.
            </p>
            {isLogin && (
              <Link className="btn btn-dark border-secondary mt-3" to="/ck/insert">
                CK 등록
              </Link>
            )}
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
                      <th className="col-2">CK 날짜</th>
                      <th className="col-5">CK 메모</th>
                      <th className="col-2">팀원</th>
                      {isAdmin && <>
                        <th className="col-2">승리팀</th>
                        <th className="col-1">기능</th>
                      </>}
                    </tr>
                  </thead>
                  <tbody>
                    {ckList.map((ck) => (
                      <tr key={ck.ckId} className="border-secondary text-center">
                        <td>
                          {editingDateId === ck.ckId ? (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <input type="date" className="form-control form-control-sm"
                                value={editDateValue} style={{ maxWidth: 170 }}
                                onChange={(e) => setEditDateValue(e.target.value)}
                              />
                              <button type="button" className="btn btn-sm btn-outline-light"
                                onClick={() => handleSaveDate(ck.ckId)} disabled={isUpdating} >
                                저장
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCancelDate}>
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span>{formatDate(ck.ckDate)}</span>
                              {isAdmin && 
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleEditDate(ck)}>
                                  <FaEdit />
                                </button>
                              }
                            </div>
                          )}
                        </td>
                        <td>
                          {editingMemoId === ck.ckId ? (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editMemoValue}
                                onChange={(e) => setEditMemoValue(e.target.value)}
                                style={{ minWidth: 200 }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                onClick={() => handleSaveMemo(ck.ckId)}
                                disabled={isUpdating}
                              >
                                저장
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCancelMemo}>
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span>{ck.ckMemo || "-"}</span>
                              {isAdmin && 
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleEditMemo(ck)}>
                                  <FaEdit />
                                </button>
                              }
                            </div>
                          )}
                        </td>
                        <td>
                          <button type="button" className="btn btn-sm btn-outline-light"
                            onClick={() => openParticipantModal(ck.ckId)}
                            > 팀원 보기 </button>
                        </td>
                        {isAdmin && <>
                          <td>
                            {editingWinnerId !== ck.ckId && (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleEditWinner(ck)}
                                >
                                  <FaEdit />
                                </button>
                            </div>
                            )}
                            {editingWinnerId === ck.ckId && (
                              <div className="mt-2">
                                <div className="btn-group w-100 mb-2" role="group">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name={`winner-${ck.ckId}`}
                                    id={`redWin-${ck.ckId}`}
                                    value="red"
                                    checked={editWinnerValue === "red"}
                                    onChange={(e) => setEditWinnerValue(e.target.value)}
                                  />
                                  <label className="btn btn-sm btn-outline-danger" htmlFor={`redWin-${ck.ckId}`}>
                                    레드 승
                                  </label>

                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name={`winner-${ck.ckId}`}
                                    id={`blueWin-${ck.ckId}`}
                                    value="blue"
                                    checked={editWinnerValue === "blue"}
                                    onChange={(e) => setEditWinnerValue(e.target.value)}
                                  />
                                  <label className="btn btn-sm btn-outline-primary" htmlFor={`blueWin-${ck.ckId}`}>
                                    블루 승
                                  </label>
                                </div>

                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light flex-fill"
                                    onClick={() => handleSaveWinner(ck.ckId)}
                                    disabled={isUpdating || !editWinnerValue}
                                  >
                                    저장
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary flex-fill"
                                    onClick={handleCancelWinner}
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                        <td>
                          <button type="button" className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteCk(ck.ckId)}
                            > 삭제 </button> 
                        </td>
                        </>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedCkId !== null && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
               onClick={closeModal} style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 }}
              >
              <div className="card bg-dark border-secondary text-white w-100 mx-3"
                onClick={(e) => e.stopPropagation()} style={{ maxWidth: 960 }}
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

                  {!participantLoading && !participantError && selectedParticipantData.length === 0 && (
                    <div className="text-white text-center py-4">참여 인원이 없습니다.</div>
                  )}

                  {!participantLoading && !participantError && selectedParticipantData.length > 0 && (
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
                                <Link to={`/streamer/${redParticipant.ckStreamer}`}
                                  className={`ck-participant-card red ${redWin ? "win" : ""} text-white text-decoration-none justify-content-end`}
                                >
                                  {redWin && <span className="badge bg-danger">승</span>}
                                  <div className="ck-participant-info text-end">
                                    <div className="ck-participant-name">{redParticipant.streamerName || "-"}</div>
                                    <div className="ck-participant-meta">{redParticipant.ckPosition || position}</div>
                                  </div>
                                  <img src={buildProfileUrl(redParticipant.streamerSoopId)}
                                    className="ck-participant-avatar" alt={redParticipant.streamerName || "Red 팀원"}
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
                                <Link to={`/streamer/${blueParticipant.ckStreamer}`}
                                  className={`ck-participant-card blue ${blueWin ? "win" : ""} text-white text-decoration-none justify-content-start`}
                                >
                                  
                                  <img  src={buildProfileUrl(blueParticipant.streamerSoopId)}
                                    className="ck-participant-avatar" alt={blueParticipant.streamerName || "Blue 팀원"}
                                  />
                                  <div className="ck-participant-info text-start">
                                    <div className="ck-participant-name">{blueParticipant.streamerName || "-"}</div>
                                    <div className="ck-participant-meta">{blueParticipant.ckPosition || position}</div>
                                  </div>
                                  {blueWin && <span className="badge bg-primary">승</span>}
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
