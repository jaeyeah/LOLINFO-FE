import axios from "axios";
import { useEffect, useState } from "react";
import "./StreamerCkStreak.css";

const formatDate = (date) => {
    if (!date) return "-";
    return String(date).replaceAll("-", ".");
};

const getStreakLabel = (result, count) => {
    if (count === null || count === undefined) return "-";
    if (result === "W") return `${Number(count).toLocaleString("ko-KR")}연승`;
    if (result === "L") return `${Number(count).toLocaleString("ko-KR")}연패`;
    return "-";
};

export default function StreamerCkStreak({ streamerNo }) {
    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;

        if (!streamerNo) {
            setStreak(null);
            setLoading(false);
            setError(false);
            return () => {
                mounted = false;
            };
        }

        const fetchStreak = async () => {
            setLoading(true);
            setError(false);

            try {
                const { data } = await axios.get(`/ck/streak/${streamerNo}`);

                if (mounted) {
                    setStreak(data ?? null);
                }
            } catch (requestError) {
                console.error("CK 연승 기록 조회 실패", requestError);

                if (mounted) {
                    setStreak(null);
                    setError(true);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchStreak();

        return () => {
            mounted = false;
        };
    }, [streamerNo]);

    if (error || (!loading && !streak)) {
        return null;
    }

    const currentResult = streak?.currentResult;
    const currentClass = currentResult === "W" ? "is-win" : currentResult === "L" ? "is-lose" : "";

    return (
        <section className="streamer-streak-card" aria-labelledby="streamer-streak-title">
            <h3 id="streamer-streak-title" className="streamer-streak-title">
                CK 연승 기록
            </h3>

            {loading ? (
                <p className="streamer-streak-loading">연승 기록을 불러오는 중...</p>
            ) : (
                <div className="streamer-streak-grid">
                    <div className={`streamer-streak-item ${currentClass}`}>
                        <span className="streamer-streak-label">현재 기록</span>
                        <strong>{getStreakLabel(currentResult, streak.currentStreak)}</strong>
                    </div>

                    <div className="streamer-streak-item">
                        <span className="streamer-streak-label">최고 연승</span>
                        <strong>{getStreakLabel("W", streak.maxWinStreak)}</strong>
                        <span className="streamer-streak-date">
                            {formatDate(streak.maxWinStart)} ~ {formatDate(streak.maxWinEnd)}
                        </span>
                    </div>

                    <div className="streamer-streak-item">
                        <span className="streamer-streak-label">최다 연패</span>
                        <strong>{getStreakLabel("L", streak.maxLoseStreak)}</strong>
                        <span className="streamer-streak-date">
                            {formatDate(streak.maxLoseStart)} ~ {formatDate(streak.maxLoseEnd)}
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}
