import { NavLink, Outlet } from "react-router-dom";
import "./Ranking.css";

export default function Ranking() {
  return (
    <section className="ranking-page text-white">
      <header className="ranking-hero">
        <p className="ranking-eyebrow">SOOPLOL RANKINGS</p>
        <h1>랭킹</h1>
        <p className="ranking-context">스트리머들의 승리와 연속 기록을 한눈에 살펴보세요.</p>
      </header>
      <nav className="ranking-categories mb-4" aria-label="랭킹 대분류">
        <NavLink to="/ranking/ck" className="ranking-category">CK</NavLink>
        <NavLink to="/ranking/myeolmang" className="ranking-category">멸망전</NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
