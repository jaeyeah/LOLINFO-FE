import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "../../utils/axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ScrimDailyChart({ tournamentId, teamId, teamName }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRecords([]);
    setLoading(true);
    setError(false);
    axios.get(`/scrim/${tournamentId}/${teamId}/daily`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setRecords(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tournamentId, teamId, retry]);

  const cumulativeRecords = useMemo(() => {
    let wins = 0;
    let losses = 0;
    return [...records].sort((a, b) => a.scrimDate.localeCompare(b.scrimDate)).map((record) => {
      wins += Number(record.winCount) || 0;
      losses += Number(record.loseCount) || 0;
      const total = wins + losses;
      return {
        scrimDate: record.scrimDate,
        winCount: wins,
        loseCount: losses,
        winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
      };
    });
  }, [records]);

  return (
    <section className="border border-secondary rounded p-3 mb-3" aria-label="누적 스크림 승률 변화">
      <h6 className="fw-bold mb-2">누적 스크림 승률 변화</h6>
      <p className="small text-secondary mb-3">
        해당 날짜까지의 누적 세트 승률입니다. 총전적과 동일하게 공식 경기 등을 포함하며, 경기 없는 날짜는 제외합니다.
      </p>
      {loading ? (
        <div className="text-center text-secondary py-4" role="status">일자별 전적을 불러오는 중입니다...</div>
      ) : error ? (
        <div className="alert alert-warning mb-0" role="alert">
          일자별 전적을 불러오지 못했습니다.
          <button type="button" className="btn btn-sm btn-outline-dark ms-2"
            onClick={() => setRetry((value) => value + 1)}>다시 시도</button>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center text-secondary py-4">승률을 표시할 경기 기록이 없습니다.</div>
      ) : (
        <div style={{ height: "250px", minWidth: 0 }}>
          <Line
            role="img" aria-label={`${teamName}의 경기일별 누적 세트 승률 선그래프`}
            data={{
              labels: cumulativeRecords.map((record) => record.scrimDate),
              datasets: [{
                label: "누적 승률",
                data: cumulativeRecords.map((record) => record.winRate),
                borderColor: "#91b9d9",
                backgroundColor: "#91b9d9",
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const record = cumulativeRecords[context.dataIndex];
                      return `누적 승률 ${record.winRate}% · ${record.winCount}승 ${record.loseCount}패 (총 ${record.winCount + record.loseCount}세트)`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: "#adb5bd", maxRotation: 45, autoSkip: true, maxTicksLimit: 6 },
                  grid: { display: false },
                },
                y: {
                  min: 0, max: 100,
                  ticks: { color: "#adb5bd", stepSize: 25, callback: (value) => `${value}%` },
                  grid: { color: "rgba(255,255,255,0.1)" },
                },
              },
            }}
          />
        </div>
      )}
    </section>
  );
}
