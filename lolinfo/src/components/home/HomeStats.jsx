import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomeStats.css";

const statItems = [
    { key: "todayVisitors", label: "오늘 방문자", unit: "명" },
    { key: "streamerCount", label: "등록 스트리머", unit: "명", to: "/streamer" },
    { key: "tournamentCount", label: "등록 대회", unit: "개", to: "/tournament" },
    { key: "ckCount", label: "누적 CK 경기", unit: "경기", to: "/ck" },
];

const formatNumber = (value) => Number(value ?? 0).toLocaleString("ko-KR");

export default function HomeStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchStats = async () => {
            try {
                const { data } = await axios.get("/visit/home");

                if (mounted) {
                    setStats(data);
                }
            } catch (error) {
                console.error("홈 데이터 현황 조회 실패", error);

                if (mounted) {
                    setStats(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchStats();

        return () => {
            mounted = false;
        };
    }, []);

    if (!loading && !stats) {
        return null;
    }

    return (
        <section className="home-stats" aria-labelledby="home-stats-title">
            <div className="home-stats-heading">
                <p className="home-stats-eyebrow">SOOPLOL DATA</p>
                <h2 id="home-stats-title">SOOPLOL 데이터 현황</h2>
            </div>

            <div className="home-stats-grid" aria-busy={loading}>
                {statItems.map((item) => {
                    const card = (
                        <article
                            className={`home-stats-card ${
                                item.to ? "home-stats-card-link" : ""
                            }`}
                        >
                            <h3>{item.label}</h3>

                            {loading ? (
                                <div
                                    className="home-stats-skeleton"
                                    aria-label="통계 불러오는 중"
                                />
                            ) : (
                                <p className="home-stats-value">
                                    <strong>{formatNumber(stats[item.key])}</strong>
                                    <span>{item.unit}</span>
                                </p>
                            )}
                        </article>
                    );

                    return item.to ? (
                        <Link
                            to={item.to}
                            className="home-stats-link"
                            key={item.key}
                        >
                            {card}
                        </Link>
                    ) : (
                        <div key={item.key}>
                            {card}
                        </div>
                    );
                })}
            </div>

            <p className="home-stats-note">
                방문자 수는 브라우저 기준 일일 중복 방문을 제외하여 집계됩니다.
            </p>
        </section>
    );
}