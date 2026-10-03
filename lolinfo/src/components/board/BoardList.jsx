import { useNavigate, useSearchParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { loginState } from "../../utils/jotai";
import "./Board.css";
import MonthlyBoardList from "./MonthlyBoardList";
import PublicFeedbackList from "./PublicFeedbackList";
import BlogBoardList from "./BlogBoardList";

const TABS = [
    { key: "feedback", label: "피드백" },
    { key: "monthly", label: "월간 소식" },
    { key: "blog", label: "블로그" },
];

export default function BoardList() {
    const navigate = useNavigate();
    const isLoggedIn = useAtomValue(loginState);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedTab = TABS.some((tab) => tab.key === searchParams.get("tab"))
        ? searchParams.get("tab")
        : "monthly";
    const selectTab = (tab) => {
        if (tab === "monthly") setSearchParams({});
        else setSearchParams({ tab });
    };

    return (
        <div className="board-list-container">
            <div className="board-list-card">
                <header className="board-list-hero">
                    <p className="board-list-eyebrow">SOOPLOL BOARD</p>
                    <h1 className="board-list-title">게시판</h1>
                    <p className="board-list-context">피드백, 월간 소식과 SOOPLOL 이야기를 확인해보세요.</p>
                </header>
                <nav className="board-category-filter" aria-label="게시판 분류">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`category-btn ${selectedTab === tab.key ? "active" : ""}`}
                            aria-pressed={selectedTab === tab.key}
                            onClick={() => selectTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                {selectedTab === "monthly" && isLoggedIn && (
                    <div className="board-list-actions">
                        <button className="btn btn-primary board-write-btn" onClick={() => navigate("/board/write")}>
                            글쓰기
                        </button>
                    </div>
                )}

                {selectedTab === "monthly" && <MonthlyBoardList />}
                {selectedTab === "feedback" && <PublicFeedbackList />}
                {selectedTab === "blog" && <BlogBoardList fromPath="/board?tab=blog" />}
            </div>
        </div>
    );
}
