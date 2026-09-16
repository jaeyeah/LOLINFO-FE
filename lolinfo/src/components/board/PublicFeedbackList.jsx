import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import Pagination from "../Pagination";

const PAGE_SIZE = 10;
const PAGE_BLOCK_SIZE = 5;

const FEEDBACK_TYPE_LABELS = {
    ERROR: "정보 오류",
    MISSING: "정보 누락",
    SUGGESTION: "개선 의견",
    ETC: "기타",
};

const STATUS_LABELS = {
    WAITING: "접수",
    CHECKING: "확인 중",
    DUPLICATE: "중복접수",
    DONE: "처리 완료",
};

const STATUS_CLASSES = {
    WAITING: "board-feedback-status-waiting",
    CHECKING: "board-feedback-status-checking",
    DUPLICATE: "board-feedback-status-duplicate",
    DONE: "board-feedback-status-done",
};

const FEEDBACK_TYPE_CLASSES = {
    ERROR: "board-feedback-type-error",
    MISSING: "board-feedback-type-missing",
    SUGGESTION: "board-feedback-type-suggestion",
    ETC: "board-feedback-type-etc",
};

const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const getReply = (feedback) => feedback.feedbackReply || feedback.feedbackAnswer || feedback.feedbackAdminReply;

const getStatusKey = (status) => String(status || "").toUpperCase();

const getContentPreview = (content) => {
    const normalizedContent = content || "";
    return {
        visible: normalizedContent.slice(0, 10),
        hidden: normalizedContent.slice(10),
    };
};

const getPageData = (page, totalCount) => {
    const totalPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const blockStart = Math.floor((page - 1) / PAGE_BLOCK_SIZE) * PAGE_BLOCK_SIZE + 1;
    return {
        page,
        totalPage,
        blockStart,
        blockFinish: Math.min(totalPage, blockStart + PAGE_BLOCK_SIZE - 1),
    };
};

export default function PublicFeedbackList() {
    const [feedbackList, setFeedbackList] = useState([]);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState(getPageData(1, 0));
    const [isServerPaginated, setIsServerPaginated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const fetchFeedback = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const { data } = await axios.get("/feedback/public", {
                    params: { page, size: PAGE_SIZE },
                    signal: controller.signal,
                });
                const isPagedResponse = !Array.isArray(data) && Boolean(data?.pageVO);
                const list = Array.isArray(data) ? data : data?.list || [];
                setFeedbackList(list);
                setIsServerPaginated(isPagedResponse);
                setPageData(isPagedResponse
                    ? { ...getPageData(page, list.length), ...data.pageVO }
                    : getPageData(page, list.length));
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("공개 피드백 조회 오류:", error);
                setFeedbackList([]);
                setErrorMessage("피드백을 불러오지 못했습니다.");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchFeedback();
        return () => controller.abort();
    }, [page]);

    if (isLoading) return <div className="board-loading">피드백을 불러오는 중입니다.</div>;
    if (errorMessage) return <div className="board-error" role="alert">{errorMessage}</div>;
    if (feedbackList.length === 0) return <div className="board-empty">공개된 피드백이 없습니다.</div>;

    const visibleFeedbackList = isServerPaginated
        ? feedbackList
        : feedbackList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <>
            <div className="board-feedback-list-header" aria-hidden="true">
                <span>접수일자</span>
                <span>내용</span>
                <span>분류</span>
                <span>처리상태</span>
            </div>
            <div className="board-feedback-list">
            {visibleFeedbackList.map((feedback) => {
                const reply = getReply(feedback);
                const contentPreview = getContentPreview(feedback.feedbackContent);
                const statusKey = getStatusKey(feedback.feedbackStatus);
                const isDuplicate = statusKey === "DUPLICATE";
                return (
                    <article key={feedback.feedbackId} className="board-feedback-item">
                        <time className="board-feedback-date" dateTime={feedback.feedbackCreated}>
                            {formatDate(feedback.feedbackCreated)}
                        </time>
                        <p className="board-feedback-content">
                            {contentPreview.visible || (!contentPreview.hidden && "내용 없음")}
                            {contentPreview.hidden && (
                                <span className="board-feedback-blinded" aria-label="공개되지 않은 내용">
                                    {contentPreview.hidden}
                                </span>
                            )}
                        </p>
                        <div className="board-feedback-meta">
                            <div className="board-feedback-type">
                                <span className={`board-feedback-type-badge ${isDuplicate ? "board-feedback-type-etc" : FEEDBACK_TYPE_CLASSES[feedback.feedbackType] || "board-feedback-type-etc"}`}>
                                    {isDuplicate
                                        ? "중복접수"
                                        : FEEDBACK_TYPE_LABELS[feedback.feedbackType] || feedback.feedbackType || "기타"}
                                </span>
                            </div>
                            <div className="board-feedback-status">
                                <span className={`board-feedback-status-badge ${STATUS_CLASSES[statusKey] || "board-feedback-status-duplicate"}`}>
                                    <span className="board-feedback-status-dot" aria-hidden="true" />
                                    {STATUS_LABELS[statusKey] || feedback.feedbackStatus || "-"}
                                </span>
                                {reply && <span className="board-feedback-answer-badge">답변 완료</span>}
                            </div>
                        </div>
                    </article>
                );
            })}
            </div>
            {pageData.totalPage > 1 && (
                <div className="board-feedback-pagination">
                    <Pagination
                        page={pageData.page}
                        totalPage={pageData.totalPage}
                        blockStart={pageData.blockStart}
                        blockFinish={pageData.blockFinish}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </>
    );
}
