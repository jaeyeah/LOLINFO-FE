import { Link } from "react-router-dom";
import HomeStreamerSearch from "./HomeStreamerSearch";
import "./Home.css";

const features = [
    {
        title: "CK 경기 기록",
        description: "스트리머가 참여한 CK 경기와 주요 결과를 확인할 수 있습니다.",
    },
    {
        title: "스트리머별 승률",
        description: "스트리머의 경기 기록을 바탕으로 한 주요 통계를 살펴볼 수 있습니다.",
    },
    {
        title: "상대전적과 팀메이트",
        description: "누구와 맞붙었고 함께 플레이했는지 기록으로 확인할 수 있습니다.",
    },
    {
        title: "월간 CK 랭킹",
        description: "월별 CK 성적과 순위 흐름을 한눈에 비교할 수 있습니다.",
    },
    {
        title: "대회 및 참가팀 기록",
        description: "역대 대회와 참가팀, 경기 정보를 찾아볼 수 있습니다.",
    },
];

function HomeHero() {
    return (
        <section className="home-hero">
            <p className="home-eyebrow">SOOP LOL DATA SERVICE</p>
            <h1>SOOP LoL 기록을 한눈에.</h1>
            <p className="home-context">
                SoopLOL은 SOOP LoL 관련 데이터를 정리해 통계로 제공하는 비공식 데이터 서비스입니다.
            </p>
            <HomeStreamerSearch />
        </section>
    );
}

function HomeNavigation() {
    return (
        <section className="home-navigation" aria-labelledby="home-navigation-title">
            <div className="home-section-heading">
                <p className="home-eyebrow">EXPLORE SOOPLOL</p>
                <h2 id="home-navigation-title">기록을 찾아보세요</h2>
            </div>
            <div className="home-navigation-grid">
                <Link to="/streamer" className="home-navigation-card">
                    <span className="home-card-label">STREAMERS</span>
                    <h3>스트리머 통계</h3>
                    <p>CK 전적, 상대전적, 팀메이트 등 스트리머별 다양한 기록을 확인해보세요.</p>
                    <span className="home-card-cta">스트리머 찾아보기 →</span>
                </Link>
                <Link to="/tournament" className="home-navigation-card">
                    <span className="home-card-label">TOURNAMENTS</span>
                    <h3>대회 기록</h3>
                    <p >역대 SOOP LoL 대회의 참가팀과 경기 기록을 확인해보세요.</p>
                    <span className="home-card-cta">대회 찾아보기 →</span>
                </Link>
            </div>
        </section>
    );
}

function HomeFeatures() {
    return (
        <section className="home-features" aria-labelledby="home-features-title">
            <div className="home-section-heading">
                <p className="home-eyebrow">WHAT YOU CAN FIND</p>
                <h2 id="home-features-title">SoopLOL에서 확인할 수 있는 기록</h2>
            </div>
            <div className="home-feature-list">
                {features.map((feature) => (
                    <article className="home-feature-item" key={feature.title}>
                        <h3>{feature.title}</h3>
                        <p className="text-secondary">{feature.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    return (
        <main className="home-page">
            <HomeHero />
            <HomeNavigation />
            <HomeFeatures />
        </main>
    );
}
