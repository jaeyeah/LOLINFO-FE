import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminFeedback.css";

const FEEDBACK_TYPE_LABELS = {
    ERROR: "정보 오류",
    MISSING: "정보 누락",
    SUGGESTION: "개선 의견",
    ETC: "기타",
};

const FEEDBACK_TYPE_CLASSES = {
    ERROR: "bg-danger",
    MISSING: "bg-warning text-dark",
    SUGGESTION: "bg-info text-dark",
    ETC: "bg-secondary",
};

const TARGET_TYPE_LABELS = {
    STREAMER: "스트리머",
    TOURNAMENT: "대회",
    CK: "CK",
    SCRIM: "스크림",
    TIER: "티어표",
};

const STATUS_LABELS = {
    WAITING: "대기",
    CHECKING: "확인 중",
    DONE: "처리 완료",
};

const STATUS_CLASSES = {
    WAITING: "bg-warning text-dark",
    CHECKING: "bg-info text-dark",
    DONE: "bg-success",
};

const DEFAULT_PAGE_DATA = {
    page: 1,
    size: 10,
    totalCount: 0,
    totalPage: 0,
    blockStart: 1,
    blockFinish: 1,
    hasPrev: false,
    hasNext: false,
};

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AdminFeedback() {
    const navigate = useNavigate();
    const [feedbackList, setFeedbackList] = useState([]);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState(DEFAULT_PAGE_DATA);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const fetchFeedback = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.get("/feedback/", {
                params: {
                    page,
                },
            });

            // PageResponseVO의 프로퍼티명이 다르면 이 매핑 부분만 수정하면 됩니다.
            const responseData = response.data;
            setFeedbackList(responseData.list || []);
            setPageData({ ...DEFAULT_PAGE_DATA, ...(responseData.pageVO || {}) });
        } catch (error) {
            console.error("피드백 목록 로드 실패", error);
            setFeedbackList([]);
            setErrorMessage(error.response?.data?.message || "피드백 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const getTargetLabel = (feedback) => {
        const targetLabel = TARGET_TYPE_LABELS[feedback.feedbackTargetType] || feedback.feedbackTargetType || "-";
        return feedback.feedbackTargetId == null
            ? targetLabel
            : `${targetLabel} #${feedback.feedbackTargetId}`;
    };

    const getFeedbackTypeLabel = (type) => FEEDBACK_TYPE_LABELS[type] || type || "-";
    const getStatusLabel = (status) => STATUS_LABELS[status] || status || "-";

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || (pageData.totalPage > 0 && pageNumber > pageData.totalPage)) return;
        setPage(pageNumber);
    };

    // 상태 수정
    const [editFeedbackId, setEditFeedbackId] = useState(null);
    const [editStatus, setEditStatus] = useState("");
    const startEditStatus = (feedback) => {
        setEditFeedbackId(feedback.feedbackId);
        setEditStatus(feedback.feedbackStatus);
    };
    const updateStatus = async () => {
        try {
            await axios.patch("/feedback/", {
                feedbackId: editFeedbackId,
                feedbackStatus: editStatus,
            });

            setEditFeedbackId(null);
            setEditStatus("");

            fetchFeedback();
        }
        catch (error) {
            console.error(error);
            alert("상태 변경 중 오류가 발생했습니다.");
        }
    };


    return (
        <div className="admin-feedback-page text-white">
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-4">
                <div>
                    <h3 className="fw-bold mb-2">피드백 관리</h3>
                    <p className="text-secondary mb-0">등록된 피드백 {pageData.totalCount}건</p>
                </div>
            </div>

            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

            <div className="table-responsive admin-feedback-table-wrap">
                <table className="table table-dark table-hover align-middle mb-0 admin-feedback-table">
                    <thead>
                        <tr>
                            <th scope="col">번호</th>
                            <th scope="col">분류</th>
                            <th scope="col">대상</th>

                            <th scope="col">등록일</th>
                            <th scope="col">링크</th>
                            <th scope="col">상태</th>
                            <th scope="col">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-5">
                                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    피드백을 불러오는 중입니다.
                                </td>
                            </tr>
                        ) : feedbackList.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-5">등록된 피드백이 없습니다.</td>
                            </tr>
                        ) : (
                            feedbackList.map((feedback) => (
                                <tr key={feedback.feedbackId}>
                                    <td>#{feedback.feedbackId}</td>
                                    <td>
                                        <span className={`badge ${FEEDBACK_TYPE_CLASSES[feedback.feedbackType] || "bg-secondary"}`}>
                                            {getFeedbackTypeLabel(feedback.feedbackType)}
                                        </span>
                                    </td>
                                    <td>{getTargetLabel(feedback)}</td>
                                    <td>{formatDateTime(feedback.feedbackCreated)}</td>
                                    <td>
                                        {feedback.feedbackUrl ? (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-link text-info p-0"
                                                onClick={() => navigate(feedback.feedbackUrl)}
                                            >
                                                원본 이동
                                            </button>
                                        ) : "-"}
                                    </td>
                    
                                    <td>
                                        {editFeedbackId === feedback.feedbackId ? (
                                            <select
                                                className="form-select form-select-sm bg-dark text-white"
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value)}
                                            >
                                                <option value="WAITING">대기</option>
                                                <option value="CHECKING">확인 중</option>
                                                <option value="DONE">처리 완료</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`badge ${
                                                    feedback.feedbackStatus === "WAITING"
                                                        ? "bg-warning text-dark"
                                                        : feedback.feedbackStatus === "CHECKING"
                                                        ? "bg-info text-dark"
                                                        : feedback.feedbackStatus === "DONE"
                                                        ? "bg-success"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {STATUS_LABELS[feedback.feedbackStatus] || feedback.feedbackStatus}
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        {editFeedbackId === feedback.feedbackId ? (
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={updateStatus}
                                                >
                                                    저장
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setEditFeedbackId(null);
                                                        setEditStatus("");
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => startEditStatus(feedback)}
                                                >
                                                    상태 변경
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-light"
                                                    onClick={() => setSelectedFeedback(feedback)}
                                                >
                                                    보기
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <nav className="mt-4" aria-label="피드백 페이지 navigation">
                <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${!pageData.hasPrev ? "disabled" : ""}`}>
                        <button
                            type="button"
                            className="page-link"
                            disabled={!pageData.hasPrev}
                            onClick={() => handlePageChange(pageData.blockStart - 1)}
                        >
                            이전
                        </button>
                    </li>
                    {Array.from(
                        { length: Math.max(0, pageData.blockFinish - pageData.blockStart + 1) },
                        (_, index) => pageData.blockStart + index
                    ).map((pageNumber) => (
                        <li key={pageNumber} className={`page-item ${page === pageNumber ? "active" : ""}`}>
                            <button type="button" className="page-link" onClick={() => handlePageChange(pageNumber)}>
                                {pageNumber}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${!pageData.hasNext ? "disabled" : ""}`}>
                        <button
                            type="button"
                            className="page-link"
                            disabled={!pageData.hasNext}
                            onClick={() => handlePageChange(pageData.blockFinish + 1)}
                        >
                            다음
                        </button>
                    </li>
                </ul>
            </nav>

            {selectedFeedback && (
                <>
                    <div className="modal fade show d-block admin-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-detail-title">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content bg-dark text-white border-secondary">
                                <div className="modal-header border-secondary">
                                    <h4 className="modal-title fs-5" id="feedback-detail-title">피드백 상세</h4>
                                    <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setSelectedFeedback(null)} />
                                </div>
                                <div className="modal-body">
                                    <dl className="row mb-0 admin-feedback-detail">
                                        <dt className="col-sm-3">제보 번호</dt>
                                        <dd className="col-sm-9">#{selectedFeedback.feedbackId}</dd>
                                        <dt className="col-sm-3">제보 유형</dt>
                                        <dd className="col-sm-9">{getFeedbackTypeLabel(selectedFeedback.feedbackType)}</dd>
                                        <dt className="col-sm-3">대상</dt>
                                        <dd className="col-sm-9">{getTargetLabel(selectedFeedback)}</dd>
                                        <dt className="col-sm-3">내용</dt>
                                        <dd className="col-sm-9 feedback-detail-content">{selectedFeedback.feedbackContent || "-"}</dd>
                                        <dt className="col-sm-3">등록 위치</dt>
                                        <dd className="col-sm-9">{selectedFeedback.feedbackUrl || "-"}</dd>
                                        <dt className="col-sm-3">방문자 ID</dt>
                                        <dd className="col-sm-9 feedback-visitor-id">{selectedFeedback.feedbackVisitorId || "-"}</dd>
                                        <dt className="col-sm-3">상태</dt>
                                        <dd className="col-sm-9">
                                            <span className={`badge ${STATUS_CLASSES[selectedFeedback.feedbackStatus] || "bg-secondary"}`}>
                                                {getStatusLabel(selectedFeedback.feedbackStatus)}
                                            </span>
                                        </dd>
                                        <dt className="col-sm-3">등록일</dt>
                                        <dd className="col-sm-9">{formatDateTime(selectedFeedback.feedbackCreated)}</dd>
                                    </dl>
                                </div>
                                <div className="modal-footer border-secondary">
                                    {selectedFeedback.feedbackUrl && (
                                        <button type="button" className="btn btn-info" onClick={() => navigate(selectedFeedback.feedbackUrl)}>
                                            원본 페이지 이동
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-outline-light" onClick={() => setSelectedFeedback(null)}>
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setSelectedFeedback(null)} />
                </>
            )}
        </div>
    );
}
