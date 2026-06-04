import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import axios from "axios";
import Swal from "sweetalert2";
import "./Board.css";

export default function BoardList() {
    const navigate = useNavigate();
    const loginId = useAtomValue(loginIdState);

    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("전체");

    const CATEGORIES = ["전체", "문의", "신고", "건의", "자유"];

    // 게시판 목록 조회
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/board/");
                setBoards(response.data || []);
            } catch (error) {
                console.error("게시판 목록 조회 오류:", error);
                Swal.fire({
                    icon: "error",
                    title: "게시판 조회 실패",
                    text: "게시판 목록을 불러오지 못했습니다.",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#ea8685",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoards();
    }, []);

    // 카테고리 필터링
    const filteredBoards = boards.filter((board) =>
        selectedCategory === "전체" ? true : board.boardCategory === selectedCategory
    );

    const handleWriteClick = useCallback(() => {
        navigate("/board/write");
    }, [navigate]);

    const handleBoardClick = useCallback(
        (boardId) => {
            navigate(`/board/${boardId}`);
        },
        [navigate]
    );

    return (
        <div className="board-list-container">
            <div className="board-list-card">
                <div className="board-list-header">
                    <h1 className="board-list-title">게시판</h1>
                    <button
                        className="btn btn-primary board-write-btn"
                        onClick={handleWriteClick}
                    >
                        글쓰기
                    </button>
                </div>

                {/* 카테고리 필터 */}
                <div className="board-category-filter">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            className={`category-btn ${
                                selectedCategory === category ? "active" : ""
                            }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* 게시판 목록 */}
                {isLoading ? (
                    <div className="board-loading">로딩 중...</div>
                ) : filteredBoards.length === 0 ? (
                    <div className="board-empty">
                        <p>게시글이 없습니다.</p>
                    </div>
                ) : (
                    <div className="board-list">
                        {filteredBoards.map((board) => (
                            <div
                                key={board.boardId}
                                className="board-item"
                                onClick={() => handleBoardClick(board.boardId)}
                            >
                                <div className="board-item-header">
                                    <span className="board-category-badge">
                                        {board.boardCategory}
                                    </span>
                                    <h3 className="board-item-title">
                                        {board.boardTitle}
                                    </h3>
                                </div>
                                <div className="board-item-footer">
                                    <span className="board-writer">
                                        {board.boardWriter}
                                    </span>
                                    <span className="board-date">
                                        {new Date(
                                            board.boardWtime
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
