import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Board.css";
import { adminState, loginIdState } from "../../utils/jotai";
import { useAtomValue } from "jotai";

export default function BoardDetail() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const loginId = useAtomValue(loginIdState);
    const isAdmin = useAtomValue(adminState);
    const [board, setBoard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadBoard = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data } = await axios.get(`/board/${boardId}`);
            setBoard(data);
        } catch (error) {
            console.error("게시글 상세 조회 오류:", error);

            Swal.fire({
                icon: "error",
                title: "게시글 조회 실패",
                text: "게시글을 불러오지 못했습니다.",
                confirmButtonText: "확인",
                confirmButtonColor: "#ea8685",
            });

            navigate("/board");
        } finally {
            setIsLoading(false);
        }
    }, [boardId, navigate]);

    useEffect(() => {
        loadBoard();
    }, [loadBoard]);

    if (isLoading) {
        return <div className="board-loading">로딩 중...</div>;
    }

    if (!board) {
        return <div className="board-empty">게시글이 없습니다.</div>;
    }

    return (
        <div className="board-detail-container">
            <div className="board-detail-card">
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
                    {board.boardContent}
                </div>

                <div className="board-detail-footer">
                    <button className="btn btn-secondary" onClick={() => navigate("/board")}>목록</button>
                    {isAdmin && (
                        <>
                            <button className="btn btn-secondary">수정</button>
                            <button className="btn btn-secondary">삭제</button>
                        </>
                    )}
                </div>


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