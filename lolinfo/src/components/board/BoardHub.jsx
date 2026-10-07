import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import { BOARD_PAGES } from "./boardCategories";

export default function BoardHub() {
    const [boards, setBoards] = useState([]);
    const [status, setStatus] = useState("loading");
    useEffect(() => {
        const controller = new AbortController();
        axios.get("/board/", { signal: controller.signal }).then(({ data }) => {
            if (controller.signal.aborted) return;
            setBoards(Array.isArray(data) ? data : data?.list || []);
            setStatus("ready");
        }).catch(() => {
            if (!controller.signal.aborted) setStatus("error");
        });
        return () => controller.abort();
    }, []);
    return (
        <div className="board-hub-sections">
            {[['story', 'blog'], ['news', '정보'], ['feedback', null]].map(([key, category]) => {
                const page = BOARD_PAGES[key];
                const recent = boards.filter((board) => board.boardCategory === category)
                    .sort((a, b) => (Date.parse(b.boardWtime) || 0) - (Date.parse(a.boardWtime) || 0)).slice(0, 3);
                return (
                    <section key={key} className="board-hub-section">
                        <h2><Link to={page.path}>{page.label} 전체보기</Link></h2>
                        <p className="board-list-context">{page.description}</p>
                        {category && status === "loading" && <p role="status">최근 게시글을 불러오는 중입니다.</p>}
                        {category && status === "error" && <p role="alert">최근 게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>}
                        {category && status === "ready" && (recent.length ? (
                            <>
                                <div className="board-monthly-list-header" aria-hidden="true">
                                    <span>작성일자</span>
                                    <span>제목</span>
                                    <span>분류</span>
                                </div>
                                <div className="board-monthly-list">
                                    {recent.map((board) => (
                                        <Link key={board.boardId} to={`/board/${board.boardId}`} className="board-monthly-item">
                                            <time className="board-monthly-date" dateTime={board.boardWtime}>
                                                {new Date(board.boardWtime).toLocaleDateString()}
                                            </time>
                                            <span className="board-monthly-title">{board.boardTitle}</span>
                                            <span className="board-monthly-category">{page.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : <p>등록된 게시글이 없습니다.</p>)}
                    </section>
                );
            })}
        </div>
    );
}
