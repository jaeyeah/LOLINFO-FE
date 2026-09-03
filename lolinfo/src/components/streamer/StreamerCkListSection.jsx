import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import Pagination from "../Pagination";
import { buildProfileUrl } from "../../utils/profileUrl";

const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];
const RESULT_STYLE = {
  승리: "bg-primary text-white",
  패배: "bg-danger text-white",
};

// CK 목록 행 컴포넌트 (테이블 용)
const CkTableRow = memo(({ ck, onOpenModal, formatDate, getStatusClass }) => (
  <tr>
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
        onClick={() => onOpenModal(ck.ckId)}>
        팀원 보기
      </button>
    </td>
  </tr>
));

CkTableRow.displayName = "CkTableRow";

// 화면 크기와 관계없이 같은 형태로 생성되는 CK 공유 이미지 영역
const CkShareCapture = memo(({ ckList, captureRef, formatDate }) => (
  <div
    ref={captureRef}
    style={{
      width: "800px",
      padding: "32px",
      boxSizing: "border-box",
      backgroundColor: "#212529",
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        fontSize: "18px",
        fontWeight: 700,
        marginBottom: "6px",
      }}
    >
      SOOPLOL
    </div>

    <div
      style={{
        fontSize: "28px",
        fontWeight: 700,
        marginBottom: "24px",
      }}
    >
       최근 CK 기록
    </div>

    {ckList.map((ck) => (
      <div
        key={ck.ckId}
        style={{
          display: "grid",
          gridTemplateColumns: "140px 100px 1fr 1fr",
          gap: "12px",
          alignItems: "center",
          padding: "12px 0",
          borderBottom: "1px solid #495057",
        }}
      >
        <div>{formatDate(ck.ckDate)}</div>

        <div style={{ textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                minWidth: "52px",
                padding: "5px 10px",
                borderRadius: "6px",

                fontSize: "14px",
                fontWeight: 700,
                lineHeight: 1.2,

                color: "#ffffff",

                backgroundColor:
                  ck.ckResult === "승리"
                    ? "#0d6efd"
                    : ck.ckResult === "패배"
                    ? "#dc3545"
                    : "#6c757d",
              }}
            >
              {ck.ckResult || "-"}
            </span>
          </div>

        <div>{ck.vsStreamerName || "-"}</div>

        <div>{ck.ckMemo || "-"}</div>
      </div>
    ))}

    <div
      style={{
        marginTop: "24px",
        textAlign: "right",
        fontSize: "14px",
        fontWeight: 700,
        letterSpacing: "1px",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      SOOPLOL.COM
    </div>
  </div>
));

CkShareCapture.displayName = "CkShareCapture";

// CK 목록 카드 컴포넌트 (모바일 용)
const CkCard = memo(({ ck, onOpenModal, formatDate, getStatusClass }) => (
  <div className="col-12">
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
          onClick={() => onOpenModal(ck.ckId)}>
          팀원 보기
        </button>
      </div>
    </div>
  </div>
));

CkCard.displayName = "CkCard";

// CK 참가자 팀 표시 컴포넌트
const ParticipantTeam = memo(({ ckId, selectedCk, selectedParticipants, selectedWinner, formatDate, participantLoading, participantError, loadedParticipants }) => {
  const sortByPosition = (a, b) =>
    POSITION_ORDER.indexOf(a.ckPosition) - POSITION_ORDER.indexOf(b.ckPosition);

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

  if (participantLoading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-light" role="status" />
      </div>
    );
  }

  if (participantError) {
    return (
      <div className="alert alert-danger" role="alert">
        {participantError}
      </div>
    );
  }

  if (!loadedParticipants) {
    return (
      <div className="text-center text-secondary py-4">
        팀원 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (selectedParticipants.length === 0) {
    return (
      <div className="text-center text-secondary py-4">
        참여한 팀원이 없습니다.
      </div>
    );
  }

  return (
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
  );
});

ParticipantTeam.displayName = "ParticipantTeam";

// 메인 CK 목록 섹션 컴포넌트
const StreamerCkListSection = memo(({ streamerId, streamerName }) => {
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState(null);
  const captureRef = useRef(null);

  const loadCkList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/ck/streamer/${streamerId}`, {
        params: { page },
      });
      setCkList(data.list ?? []);
      setPageVO(data.pageVO ?? null);
      setPage(data.pageVO?.page ?? data.page ?? page);
      setTotalPage(data.pageVO?.totalPage ?? data.totalPage ?? 1);
    } catch (err) {
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
        const winner = data[0]?.ckWinner ?? null;
        setParticipantCache((prev) => ({
          ...prev,
          [ckId]: {
            participants: data,
            winner,
          },
        }));
      } catch (err) {
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

  const handleSaveImage = async () => {
    if (!captureRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setCaptureError(null);

      const node = captureRef.current;

      const width = node.scrollWidth;
      const height = node.scrollHeight;

      console.log("capture node:", node);
      console.log("capture size:", width, height);

      const dataUrl = await toPng(node, {
        cacheBust: true,

        width,
        height,

        canvasWidth: width * 2,
        canvasHeight: height * 2,

        backgroundColor: "#212529",

        style: {
          transform: "none",
        },
      });

      const safeName =
        streamerName?.trim().replace(/[\\/:*?"<>|]/g, "-");

      const fileName = safeName
        ? `sooplol-${safeName}-ck.png`
        : `sooplol-ck-${streamerId}.png`;

      const link = document.createElement("a");

      link.download = fileName;
      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (captureErr) {
      console.error("CK 이미지 생성 실패", captureErr);

      setCaptureError(
        "이미지를 저장하지 못했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsCapturing(false);
    }
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
          {hasCkRecords ? (
            <>
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={handleSaveImage}
                  disabled={isCapturing}
                >
                  {isCapturing ? "이미지 생성 중..." : "이미지 저장"}
                </button>
              </div>
              {captureError && <div className="alert alert-danger py-2" role="alert">{captureError}</div>}

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
                        <CkTableRow
                          key={ck.ckId}
                          ck={ck}
                          onOpenModal={openModal}
                          formatDate={formatDate}
                          getStatusClass={getStatusClass}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="d-block d-md-none">
                <div className="row g-3">
                  {ckList.map((ck) => (
                    <CkCard
                      key={ck.ckId}
                      ck={ck}
                      onOpenModal={openModal}
                      formatDate={formatDate}
                      getStatusClass={getStatusClass}
                    />
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
        </>
      )}

      {/* CK 이미지 저장 전용 영역 */}
      <div className="ck-share-hidden">
        <CkShareCapture
          ckList={ckList}
          captureRef={captureRef}
          formatDate={formatDate}
        />
      </div>

      {/* CK 팀원 모달 */}
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
              <ParticipantTeam
                ckId={selectedCkId}
                selectedCk={selectedCk}
                selectedParticipants={selectedParticipants}
                selectedWinner={selectedWinner}
                formatDate={formatDate}
                participantLoading={participantLoading}
                participantError={participantError}
                loadedParticipants={loadedParticipants}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});

StreamerCkListSection.displayName = "StreamerCkListSection";

export default StreamerCkListSection;
