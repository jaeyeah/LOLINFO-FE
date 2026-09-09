import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../utils/axios";
import Swal from "sweetalert2";
import "./Board.css";
import { adminState, loginIdState, loginState } from "../../utils/jotai";
import { useAtomValue } from "jotai";
import { renderContentWithLinks } from "./renderContentWithLinks";

const CATEGORIES = ["자유", "제보", "문의", "정보"];
const getByteLength = (value) => new TextEncoder().encode(value).length;

export default function BoardDetail() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const loginId = useAtomValue(loginIdState);
    const isAdmin = useAtomValue(adminState);
    const isLoggedIn = useAtomValue(loginState);
    const [board, setBoard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        boardId: 0, boardCategory: "", boardTitle: "", boardContent: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const actionPending = useRef(false);
    const pageController = useRef(null);
    // UI 노출용이며 실제 작성자/관리자 권한은 서버에서 검증한다.
    const canManage = isLoggedIn && (loginId === board?.boardWriter || isAdmin);

    const loadBoard = useCallback(async (signal) => {
        try {
            setIsLoading(true);

            const { data } = await axios.get(`/board/${boardId}`, { signal });
            if (signal.aborted) return;
            setBoard(data);
        } catch (error) {
            if (signal.aborted || axios.isCancel(error)) return;
            console.error("게시글 상세 조회 오류:", error);

            await Swal.fire({
                icon: "error",
                title: "게시글 조회 실패",
                text: error.response?.status === 404
                    ? "존재하지 않는 게시글입니다." : "게시글을 불러오지 못했습니다.",
                confirmButtonText: "확인",
                confirmButtonColor: "#ea8685",
            });

            if (!signal.aborted) navigate("/board");
        } finally {
            if (!signal.aborted) setIsLoading(false);
        }
    }, [boardId, navigate]);

    useEffect(() => {
        const controller = new AbortController();
        pageController.current = controller;
        setIsEditMode(false);
        setBoard(null);
        setIsSubmitting(false);
        actionPending.current = false;
        loadBoard(controller.signal);
        return () => controller.abort();
    }, [loadBoard]);

    const showRequestError = async (error, signal) => {
        if (signal.aborted) return;
        const status = error.response?.status;
        await Swal.fire({
            icon: "error",
            title: "요청 실패",
            text: status === 401 || status === 403
                ? "수정/삭제 권한이 없습니다."
                : status === 404 ? "존재하지 않는 게시글입니다."
                    : "요청 처리 중 오류가 발생했습니다.",
            confirmButtonText: "확인",
            confirmButtonColor: "#ea8685",
        });
        if (status === 404 && !signal.aborted) navigate("/board");
    };

    const startEdit = () => {
        if (!canManage || actionPending.current) return;
        setEditForm({
            boardId: board.boardId,
            boardCategory: board.boardCategory || "",
            boardTitle: board.boardTitle || "",
            boardContent: board.boardContent || "",
        });
        setIsEditMode(true);
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = async (event) => {
        event.preventDefault();
        if (!canManage || actionPending.current) return;
        const validation = !editForm.boardCategory ? "카테고리를 선택해주세요."
            : !editForm.boardTitle.trim() ? "제목을 입력해주세요."
                : !editForm.boardContent.trim() ? "내용을 입력해주세요."
                    : getByteLength(editForm.boardTitle) > 50 ? "제목은 50 Byte 이내로 입력해주세요."
                        : getByteLength(editForm.boardContent) > 3000 ? "내용은 3000 Byte 이내로 입력해주세요." : "";
        if (validation) {
            await Swal.fire({ icon: "warning", text: validation, confirmButtonText: "확인" });
            return;
        }
        const { signal } = pageController.current;
        actionPending.current = true;
        setIsSubmitting(true);
        try {
            const { boardId, boardCategory, boardTitle, boardContent } = editForm;
            await axios.put("/board/", { boardId, boardCategory, boardTitle, boardContent });
            if (signal.aborted) return;
            await Swal.fire({ icon: "success", text: "게시글이 수정되었습니다.", confirmButtonText: "확인" });
            if (signal.aborted) return;
            setIsEditMode(false);
            await loadBoard(signal);
        } catch (error) {
            await showRequestError(error, signal);
        } finally {
            if (!signal.aborted) {
                actionPending.current = false;
                setIsSubmitting(false);
            }
        }
    };

    const handleDelete = async () => {
        if (!canManage || actionPending.current) return;
        const { signal } = pageController.current;
        actionPending.current = true;
        setIsSubmitting(true);
        try {
            const result = await Swal.fire({
                title: "게시글을 삭제하시겠습니까?",
                text: "삭제한 게시글은 복구할 수 없습니다.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "삭제",
                cancelButtonText: "취소",
                confirmButtonColor: "#dc3545",
            });
            if (!result.isConfirmed || signal.aborted) return;
            await axios.delete(`/board/${boardId}`);
            if (signal.aborted) return;
            await Swal.fire({
                icon: "success", title: "삭제 완료", text: "게시글이 삭제되었습니다.",
                confirmButtonText: "확인",
            });
            if (!signal.aborted) navigate("/board");
        } catch (error) {
            await showRequestError(error, signal);
        } finally {
            if (!signal.aborted) {
                actionPending.current = false;
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading) {
        return <div className="board-loading">로딩 중...</div>;
    }

    if (!board) {
        return <div className="board-empty">게시글이 없습니다.</div>;
    }

    return (
        <div className="board-detail-container">
            <div className="board-detail-card">
                {isEditMode && canManage ? (
                    <form onSubmit={handleEdit} className="board-write-form">
                        <div>
                            <label htmlFor="board-edit-category" className="form-label">카테고리</label>
                            <select id="board-edit-category" name="boardCategory" className="form-select board-select"
                                value={editForm.boardCategory} onChange={handleEditChange} disabled={isSubmitting}>
                                <option value="" disabled>카테고리를 선택해주세요</option>
                                {editForm.boardCategory && !CATEGORIES.includes(editForm.boardCategory) && (
                                    <option value={editForm.boardCategory}>{editForm.boardCategory}</option>
                                )}
                                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="board-edit-title" className="form-label">제목</label>
                            <input id="board-edit-title" name="boardTitle" type="text" className="form-control board-input"
                                value={editForm.boardTitle} onChange={handleEditChange} disabled={isSubmitting}
                                aria-describedby="board-edit-title-limit" />
                            <small id="board-edit-title-limit">{getByteLength(editForm.boardTitle)}/50 Byte</small>
                        </div>
                        <div>
                            <label htmlFor="board-edit-content" className="form-label">내용</label>
                            <textarea id="board-edit-content" name="boardContent" className="form-control board-textarea"
                                rows={10} value={editForm.boardContent} onChange={handleEditChange} disabled={isSubmitting}
                                aria-describedby="board-edit-content-limit" />
                            <small id="board-edit-content-limit">{getByteLength(editForm.boardContent)}/3000 Byte</small>
                        </div>
                        <div className="board-detail-footer">
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? "수정 중..." : "수정 완료"}
                            </button>
                            <button type="button" className="btn btn-outline-secondary" disabled={isSubmitting}
                                onClick={() => setIsEditMode(false)}>취소</button>
                        </div>
                    </form>
                ) : (
                    <>
                <div className="board-detail-header">
                    

                    <h1 className="board-detail-title">
                        {board.boardTitle}
                    </h1>

                    <div className="board-detail-info">
                        <span className="board-category-badge">
                            {board.boardCategory}
                        </span>
                        <span>작성자: {board.boardWriter}</span>
                        <span>
                            작성일:{" "}
                            {board.boardWtime
                                ? new Date(board.boardWtime).toLocaleDateString()
                                : ""}
                        </span>
                    </div>
                </div>

                <div className="board-detail-content">
                    {renderContentWithLinks(board.boardContent)}
                </div>

                <div className="board-detail-footer">
                    {canManage && (
                        <>
                            <button type="button" className="btn btn-primary" onClick={startEdit} disabled={isSubmitting}>수정</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isSubmitting}>삭제</button>
                        </>
                    )}
                    <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={() => navigate("/board")}>목록</button>
                </div>
                    </>
                )}


                {/* 댓글 섹션 : 미구현 */}
                {/* <div className="board-comment-section">
                    <h3>댓글</h3>
                    <div className="comment-list">
                        {board.replies && board.replies.length > 0 ? (
                            board.replies.map((reply, index) => (
                                <div className="comment-card" key={reply.id || index}>
                                    <div className="comment-header">
                                        <span className="comment-author">{reply.writer || reply.replyWriter}</span>
                                        <span className="comment-date">
                                            {reply.wtime
                                                ? new Date(reply.wtime).toLocaleDateString()
                                                : reply.replyWtime
                                                    ? new Date(reply.replyWtime).toLocaleDateString()
                                                    : ""
                                            }
                                        </span>
                                    </div>
                                    <div className="comment-body">
                                        {reply.content || reply.replyContent}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="comment-card">
                                아직 등록된 댓글이 없습니다.
                            </div>
                        )}
                    </div>
                </div> */}
            </div>
        </div>
    );
}
