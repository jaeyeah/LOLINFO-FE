import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../../utils/axios";

const MONTHLY_BOARD_CATEGORY = "정보";

export default function MonthlyBoardList({ loginId }) {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleBoardClick = useCallback((boardId) => {
        if (!loginId) {
            Swal.fire({
                icon: "info",
                title: "로그인이 필요합니다.",
                text: "게시글을 확인하려면 로그인해주세요.",
                confirmButtonText: "확인",
            });
            return;
        }
        navigate(`/board/${boardId}`);
    }, [loginId, navigate]);

    useEffect(() => {
        if (!loginId) {
            setBoards([]);
            setErrorMessage("");
            setIsLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        const fetchBoards = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const { data } = await axios.get("/board/", { signal: controller.signal });
                const boardList = Array.isArray(data) ? data : data?.list || [];
                setBoards(boardList.filter((board) => board.boardCategory === MONTHLY_BOARD_CATEGORY));
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("월간 소식 조회 오류:", error);
                setBoards([]);
                setErrorMessage("월간 소식을 불러오지 못했습니다.");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchBoards();
        return () => controller.abort();
    }, [loginId]);

    if (!loginId) return <div className="board-access-message">월간 소식을 확인하려면 로그인해주세요.</div>;
    if (isLoading) return <div className="board-loading">월간 소식을 불러오는 중입니다.</div>;
    if (errorMessage) return <div className="board-error" role="alert">{errorMessage}</div>;
    if (boards.length === 0) return <div className="board-empty">등록된 월간 소식이 없습니다.</div>;

    return (
        <div className="board-list">
            {boards.map((board) => (
                <div key={board.boardId} className="row board-item" onClick={() => handleBoardClick(board.boardId)} role="button" tabIndex="0">
                    <div className="col-9 board-item-header">
                        <span className="board-category-badge">월간 소식</span>
                        <h3 className="board-item-title">{board.boardTitle}</h3>
                    </div>
                    <div className="col-3 board-item-footer">
                        {/* <span className="board-writer">{board.memberNickname}</span> */}
                        <span className="board-date">{new Date(board.boardWtime).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}