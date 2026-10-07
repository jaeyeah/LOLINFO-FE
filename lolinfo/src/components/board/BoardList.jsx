import { Link, Navigate, NavLink, useSearchParams } from "react-router-dom";
import BoardSeo from "./BoardSeo";
import { useAtomValue } from "jotai";
import { loginState } from "../../utils/jotai";
import "./Board.css";
import MonthlyBoardList from "./MonthlyBoardList";
import PublicFeedbackList from "./PublicFeedbackList";
import BlogBoardList from "./BlogBoardList";
import BoardHub from "./BoardHub";
import { BOARD_PAGES, LEGACY_BOARD_TABS } from "./boardCategories";

export default function BoardList({ category = "hub" }) {
    const isLoggedIn = useAtomValue(loginState);
    const [searchParams] = useSearchParams();
    const page = BOARD_PAGES[category];
    const legacyPath = category === "hub" && LEGACY_BOARD_TABS[searchParams.get("tab")];
    if (legacyPath) return <Navigate to={legacyPath} replace />;

    return (
        <div className="board-list-container">
            <BoardSeo>
                <title>{page.title}</title>
                <meta name="description" content={page.description} />
                <meta name="robots" content={category === "feedback" ? "noindex,follow" : "index,follow"} />
                <link rel="canonical" href={`https://sooplol.com${page.path}`} />
            </BoardSeo>
            <div className="board-list-card">
                <header className="board-list-hero">
                    <p className="board-list-eyebrow">SOOPLOL BOARD</p>
                    <h1 className="board-list-title">{page.heading}</h1>
                    <p className="board-list-context">{page.description}</p>
                </header>
                <nav className="board-category-filter" aria-label="게시판 분류">
                    {Object.values(BOARD_PAGES).map((tab) => (
                        <NavLink key={tab.path} to={tab.path} end
                            className={({ isActive }) => `category-btn ${isActive ? "active" : ""}`}>
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>
                {category === "news" && isLoggedIn && (
                    <div className="board-list-actions">
                        <Link className="btn btn-primary board-write-btn" to="/board/write">글쓰기</Link>
                    </div>
                )}
                {category === "hub" && <BoardHub />}
                {category === "news" && <MonthlyBoardList />}
                {category === "feedback" && <PublicFeedbackList />}
                {category === "story" && <BlogBoardList fromPath="/board/story" />}
            </div>
        </div>
    );
}
