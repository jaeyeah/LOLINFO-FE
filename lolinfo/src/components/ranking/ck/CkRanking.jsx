import { useEffect, useState } from "react";
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
