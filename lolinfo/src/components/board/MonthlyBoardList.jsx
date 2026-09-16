import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";

const MONTHLY_BOARD_CATEGORY = "정보";

export default function MonthlyBoardList() {
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const fetchBoards = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const { data } = await axios.get("/board/", { signal: controller.signal });
                const boardList = Array.isArray(data) ? data : data?.list || [];
                if (!controller.signal.aborted) setBoards(boardList.filter((board) => board.boardCategory === MONTHLY_BOARD_CATEGORY));
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
    }, []);

    if (isLoading) return <div className="board-loading">월간 소식을 불러오는 중입니다.</div>;
    if (errorMessage) return <div className="board-error" role="alert">{errorMessage}</div>;
    if (boards.length === 0) return <div className="board-empty">등록된 월간 소식이 없습니다.</div>;

    return (
        <>
            <div className="board-monthly-list-header" aria-hidden="true">
                <span>작성일자</span>
                <span>제목</span>
                <span>분류</span>
            </div>
            <div className="board-monthly-list">
                {boards.map((board) => (
                    <Link key={board.boardId} to={`/board/${board.boardId}`} className="board-monthly-item">
                        <time className="board-monthly-date" dateTime={board.boardWtime}>
                            {new Date(board.boardWtime).toLocaleDateString()}
                        </time>
                        <span className="board-monthly-title">{board.boardTitle}</span>
                        <span className="board-monthly-category">월간 소식</span>
                    </Link>
                ))}
            </div>
        </>
    );
}
