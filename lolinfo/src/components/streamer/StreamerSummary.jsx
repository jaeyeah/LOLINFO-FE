import React from "react";
import "./Streamer.css";
import "./StreamerSummary.css";

const getCount = (value) => Number(value ?? 0);

export default function StreamerSummary({ streamer }) {
    if (!streamer?.streamerName) return null;

    // CK 전체 기록
    const ckPlayCount = getCount(streamer.ckPlayCount);
    const ckWinCount = getCount(streamer.ckWinCount);
    const ckLoseCount = getCount(streamer.ckLoseCount);
    const ckWinRate = getCount(streamer.ckWinRate);
    const hasCkRecord = ckPlayCount > 0;

    // 현재 연승 / 연패
    const currentStreak = getCount(streamer.currentStreak);
    const currentResult = streamer.currentResult;
    const hasCurrentStreak = currentStreak > 0;

    // 멸망전 기록
    const officialResults = [];

    const officialRanking1 = getCount(streamer.officialRanking1);
    const officialRanking2 = getCount(streamer.officialRanking2);
    const officialRanking3 = getCount(streamer.officialRanking3);

    if (officialRanking1 > 0) {
        officialResults.push(
            <>
                <strong className="summary-value summary-ranking-win">
    우승 {officialRanking1}회
</strong>
            </>
        );
    }

    if (officialRanking2 > 0) {
        officialResults.push(
            <>
                <strong className="summary-highlight">
                    준우승 {officialRanking2}회
                </strong>
            </>
        );
    }

    if (officialRanking3 > 0) {
        officialResults.push(
            <>
                <strong className="summary-highlight">
                    4강 {officialRanking3}회
                </strong>
            </>
        );
    }

    const hasOfficialRecord = officialResults.length > 0;
    const getWinRateClass = (winRate) => {
        if (winRate >= 55) return "summary-rate-high";
        if (winRate >= 50) return "summary-rate-good";
        if (winRate >= 45) return "summary-rate-low";
        return "summary-rate-bad";
    };
    return (
        <section
            className="streamer-summary"
            aria-labelledby="streamer-summary-title"
        >
            <h3
                id="streamer-summary-title"
                className="streamer-summary-title"
            >
                {streamer.streamerName} 기록 요약
            </h3>

            <p className="streamer-summary-text mb-0">
                SOOPLOL에 집계된 {streamer.streamerName}의 SOOP LOL 활동 기록입니다.

                {hasCurrentStreak && currentResult === "W" && (
    <>
        {" "}현재 CK{" "}
        <strong className="summary-value summary-streak-win">
            {currentStreak}연승
        </strong>
        을 기록 중입니다.
    </>
)}

{hasCurrentStreak && currentResult === "L" && (
    <>
        {" "}현재 CK{" "}
        <strong className="summary-value summary-streak-lose">
            {currentStreak}연패
        </strong>
        를 기록 중입니다.
    </>
)}

                {hasOfficialRecord && (
                    <>
                        {" "}LOL 멸망전에서는{" "}
                        {officialResults.map((result, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && ", "}
                                {result}
                            </React.Fragment>
                        ))}
                        을 기록했습니다.
                    </>
                )}

                {!hasCkRecord && !hasOfficialRecord && (
                    <>
                        {" "}대회 참가 기록과 CK 전적, 팀메이트 정보를 확인할 수 있습니다.
                    </>
                )}
            </p>
        </section>
    );
}