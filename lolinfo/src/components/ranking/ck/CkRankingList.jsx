import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../../utils/profileUrl";
import "../../ck/Ck.css";
import { motion, useReducedMotion } from "motion/react";
import { getRankingRowMotion } from "./rankingMotion";

const MotionRow = motion.div;

export default function CkRankingList({ rows, rankingType, result }) {
  const shouldReduceMotion = useReducedMotion();
  const isStreak = rankingType === "currentStreak" || rankingType === "maxStreak";
  return (
    <div className="d-flex flex-column gap-2">
      {rows.map((row, index) => {
        const rate = typeof row.winRate === "number" && Number.isFinite(row.winRate) ? row.winRate : null;
        const rateText = rate === null ? "-" : `${rate.toFixed(1)}%`;
        const streakLabel = result === "W" ? "연승" : "연패";
        const highlight = isStreak ? result === "W" ? "ck-ranking-streak" : "ck-ranking-page-loss" : "border-secondary";
        return (
          <MotionRow key={row.streamerNo} {...getRankingRowMotion(index, shouldReduceMotion)}
            className={`ck-ranking-page-row border rounded ${highlight}`}>
            <span className={`ck-ranking-page-rank ${row.rank >= 1 && row.rank <= 3 ? `ck-ranking-page-rank-${row.rank}` : ""}`}>
              {row.rank ?? "-"}
            </span>
            <Link to={`/streamer/${row.streamerNo}`} className="ck-ranking-page-profile text-white text-decoration-none">
              <img src={buildProfileUrl(row.streamerSoopId)} alt="" className="rounded-circle border border-secondary" />
              <span className="fw-semibold">{row.streamerName || "-"}</span>
            </Link>
            <div className="ck-ranking-page-value text-end">
              <strong>{isStreak ? `${row.streakCount ?? "-"}${streakLabel}` : rankingType === "winRate" ? rateText : `${row.winCount ?? "-"}승`}</strong>
              {!isStreak && (
                <>
                  {rankingType !== "winRate" && <div className="small text-white-50">승률 {rateText}</div>}
                  {rate !== null && <div className="progress bg-secondary bg-opacity-25 mt-1">
                    <div className="progress-bar" role="progressbar" aria-label="승률" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100}
                      style={{ width: `${Math.max(0, Math.min(100, rate))}%` }} />
                  </div>}
                </>
              )}
            </div>
            <div className="ck-ranking-page-record small text-white-50">
              {isStreak ? (
                row.streakStartDate && row.streakEndDate ? `${row.streakStartDate} ~ ${row.streakEndDate}` : "기록 기간 정보 없음"
              ) : `${row.playCount ?? "-"}전 · ${row.winCount ?? "-"}승 · ${row.loseCount ?? "-"}패`}
            </div>
          </MotionRow>
        );
      })}
    </div>
  );
}
