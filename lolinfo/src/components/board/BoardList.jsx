import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import "./Board.css";
import MonthlyBoardList from "./MonthlyBoardList";
import PublicFeedbackList from "./PublicFeedbackList";

const TABS = [
    { key: "feedback", label: "피드백" },
    { key: "monthly", label: "월간 소식" },
];

export default function BoardList() {
    const navigate = useNavigate();
    const loginId = useAtomValue(loginIdState);
    const [selectedTab, setSelectedTab] = useState("feedback");

    return (
        <div className="board-list-container">
            <div className="board-list-card">
                <div className="board-list-header">
                    <h1 className="board-list-title">게시판</h1>
                    {selectedTab === "monthly" && loginId && (
                        <button className="btn btn-primary board-write-btn" onClick={() => navigate("/board/write")}>
                            글쓰기
                        </button>
                    )}
                </div>

                <div className="board-category-filter">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`category-btn ${selectedTab === tab.key ? "active" : ""}`}
                            onClick={() => setSelectedTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {selectedTab === "monthly" ? <MonthlyBoardList loginId={loginId} /> : <PublicFeedbackList />}
            </div>
        </div>
    );
}
