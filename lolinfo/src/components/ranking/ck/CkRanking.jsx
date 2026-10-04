import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";
import axios from "../../../utils/axios";
import { getKoreaToday } from "../../../utils/ckPeriod";
import CkMonthRanking from "../../ck/CkMonthRanking";
import CkRankingList from "./CkRankingList";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getRankingTransition } from "./rankingMotion";

const LIMIT = 10;
const MotionSection = motion.section;
const MIN_PLAY_COUNT = 30;
const RANKING_TYPES = [
  ["allWins", "역대 다승"],
  ["yearWins", "올해 다승"],
  ["month", "월간 다승"],
  ["winRate", "역대 승률"],
  ["currentStreak", "현재 연속 기록"],
  ["maxStreak", "역대 연속 기록"],
];

export default function CkRanking() {
  const shouldReduceMotion = useReducedMotion();
  const [rankingType, setRankingType] = useState("allWins");
  const [year] = useState(() => Number(getKoreaToday().slice(0, 4)));

  return (
    <div className="ck-ranking-page">
      <header className="ck-ranking-intro">
        <h2 className="h4">CK 랭킹</h2>
        <p>SOOPLOL에 등록된 CK 기록을 바탕으로 스트리머의 다승, 승률, 연승·연패 기록을 확인할 수 있습니다. 역대·연간·월간 기록을 비교하며 기간별로 활발하게 참여한 스트리머와 성적의 변화를 살펴보세요.</p>
        <p>다승은 경기 참여 횟수의 영향을 받고, 승률은 경기 수와 상대·팀 구성에 따라 달라질 수 있습니다. 순위와 함께 경기 수, 승패 기록을 확인해 주세요.</p>
        <details className="ck-ranking-info">
          <summary><FaInfoCircle aria-hidden="true" /> 집계 기준</summary>
          <div className="ck-ranking-info-content">
            <h3 className="h6">CK 랭킹 집계 기준</h3>
            <ul>
              <li>SOOPLOL에 등록된 CK 기록만 반영하므로 실제 전체 경기 기록과 차이가 있을 수 있습니다.</li>
              <li>CK 승패는 개별 세트가 아닌 매치 결과를 기준으로 집계합니다. 예를 들어 2:1로 승리한 매치는 1승으로 기록합니다.</li>
              <li>다승은 승리 횟수를, 승률은 경기 수 대비 승리 비율을 보여줍니다. 경기 수가 적은 스트리머의 승률은 소수 경기 결과에 따라 크게 달라질 수 있습니다.</li>
              <li>현재 연속 기록은 최근 경기까지 이어진 연승·연패를, 역대 연속 기록은 등록된 기록에서 가장 길게 이어진 연승·연패를 의미합니다.</li>
              <li>누락 기록 추가나 경기 결과 수정에 따라 순위와 통계가 달라질 수 있습니다.</li>
            </ul>
            <p>자세한 기준은 <Link to="/about#data-criteria">서비스 소개의 데이터 집계 기준</Link>에서 확인할 수 있습니다. 잘못된 기록이나 누락 경기는 <Link to="/about#report-title">오류·누락 제보</Link>로 알려주세요.</p>
          </div>
        </details>
      </header>
      <div className="ck-ranking-page-types mb-3" role="group" aria-label="CK 랭킹 종류">
        {RANKING_TYPES.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={rankingType === value}
            className={`ck-ranking-page-type ${rankingType === value ? "active" : ""}`}
            onClick={() => setRankingType(value)}>{label}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {rankingType === "month" ? (
          <CkMonthRanking key={rankingType} animateRows motionProps={getRankingTransition(shouldReduceMotion)} />
        ) : (
          <RankingResults key={rankingType} rankingType={rankingType} year={year}
            motionProps={getRankingTransition(shouldReduceMotion)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RankingResults({ rankingType, year, motionProps }) {
  const [result, setResult] = useState("W");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isStreak = rankingType === "currentStreak" || rankingType === "maxStreak";

  useEffect(() => {
    const controller = new AbortController();
    const fetchRanking = async () => {
      let url;
      let params;
      if (isStreak) {
        url = "/rank/ck/streak";
        params = { type: rankingType === "currentStreak" ? "current" : "max", limit: LIMIT };
      } else if (rankingType === "winRate") {
        url = "/rank/ck/win-rate";
        params = { minPlayCount: MIN_PLAY_COUNT, limit: LIMIT };
      } else {
        url = "/rank/ck/win";
        params = { period: rankingType === "yearWins" ? "year" : "all", limit: LIMIT };
        if (rankingType === "yearWins") params.year = year;
      }
      try {
        const response = await axios.get(url, { params, signal: controller.signal });
        if (controller.signal.aborted) return;
        const payload = response.data;
        if (isStreak ? !Array.isArray(payload?.winList) || !Array.isArray(payload?.loseList) : !Array.isArray(payload)) {
          throw new Error("잘못된 랭킹 응답 형식");
        }
        setData(payload);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchRanking();
    return () => controller.abort();
  }, [rankingType, year, isStreak]);

  const title = isStreak
    ? `${rankingType === "currentStreak" ? "현재" : "역대 최다"} ${result === "W" ? "연승" : "연패"}`
    : rankingType === "yearWins" ? `${year} CK 다승`
    : rankingType === "allWins" ? "역대 CK 다승" : "역대 CK 승률";
  const rows = isStreak ? data?.[result === "W" ? "winList" : "loseList"] ?? [] : data ?? [];

  return (
    <MotionSection {...motionProps} className="card bg-dark border-secondary text-white shadow-sm" aria-busy={loading}>
      <div className="card-body">
        <div className="ck-ranking-page-heading">
          <h2 className="h4 mb-0">{title} Top {LIMIT}</h2>
          {isStreak && (
            <div className="btn-group" role="group" aria-label="연속 기록 결과">
              {[["W", "연승"], ["L", "연패"]].map(([value, label]) => (
                <button key={value} type="button" aria-pressed={result === value}
                  className={`btn btn-sm ${result === value ? "btn-light" : "btn-outline-secondary text-light"}`}
                  onClick={() => setResult(value)}>{label}</button>
              ))}
            </div>
          )}
        </div>
        {rankingType === "winRate" && <p className="small text-white-50">{MIN_PLAY_COUNT}경기 이상 참가자 기준</p>}
        {loading ? (
          <div className="d-flex justify-content-center py-4" role="status">
            <div className="spinner-border text-light" /><span className="visually-hidden">랭킹 불러오는 중</span>
          </div>
        ) : error ? <div className="alert alert-danger py-2 mb-0" role="alert">랭킹 정보를 불러오지 못했습니다.</div>
          : rows.length === 0 ? <p className="text-center text-secondary py-4 mb-0">랭킹 데이터가 없습니다.</p>
          : <CkRankingList rows={rows} rankingType={rankingType} result={result} />}
      </div>
    </MotionSection>
  );
}
