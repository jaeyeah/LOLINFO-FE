import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LineElement, LinearScale, PointElement, Tooltip);
const POSITIONS = ["TOP", "JUG", "MID", "AD", "SUP"];
const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#c084fc"];
import { formatRate, formatChange } from "./streamerStatFormat";
const legend = { position: "bottom", labels: { color: "#ddd" } };
function options(stacked = false, percentage = false, tooltip) {
    return {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend, tooltip: tooltip ? { callbacks: { label: tooltip } } : {} },
        scales: {
            x: { stacked, ticks: { color: "#bbb", maxRotation: 0 }, grid: { color: "#ffffff0d" } },
            y: { stacked, min: 0, ...(percentage ? { max: 100 } : {}),
                ticks: { color: "#bbb", precision: 0, ...(percentage ? { callback: (value) => `${value}%` } : {}) },
                grid: { color: "#ffffff14" } },
        },
    };
}
export default function StreamerMonthlyCharts({ data }) {
    const { months, positions, summary } = data;
    const labels = months.map((month) => `${month.month}월`);
    const monthlyTooltip = (context) => {
        if (context.datasetIndex !== 0 && context.chart.isDatasetVisible(0)) return null;
        const m = months[context.dataIndex];
        return [`참여: ${m.participationCount}경기`, `승리: ${m.winCount}승`, `패배: ${m.loseCount}패`, `월간 승률: ${formatRate(m.winRate)}`];
    };
    const cumulativeTooltip = (context) => {
        const m = months[context.dataIndex];
        return [`누적: ${m.cumulativeWinCount}승 ${m.cumulativeLoseCount}패`,
            `누적 승률: ${formatRate(m.cumulativeWinRate)}`, `전월 대비: ${formatChange(m.winRateChange)}`];
    };
    return <div className="streamer-monthly-charts">
        <section className="stat-chart-panel"><h2>월별 CK 참여 및 승리</h2>
            <div className="streamer-monthly-canvas"><Bar aria-label="월별 CK 참여 및 승리 차트" role="img" data={{ labels, datasets: [
                { label: "참여 건수", data: months.map((m) => m.participationCount), backgroundColor: "#60a5fa" },
                { label: "승리 수", data: months.map((m) => m.winCount), backgroundColor: "#34d399" },
            ] }} options={options(false, false, monthlyTooltip)} /></div>
        </section>
        <section className="stat-chart-panel"><h2>월별 누적 승률 추이</h2><p>1월 1일부터 각 월 말까지 · 현재 월은 조회 시점까지</p>
            {months.every((m) => m.cumulativeWinRate == null) ? <p className="stat-status">승패가 확정된 경기가 없습니다.</p> :
                <div className="streamer-monthly-canvas"><Line aria-label="연초부터의 월별 누적 승률" role="img" data={{ labels, datasets: [
                    { label: "누적 승률", data: months.map((m) => m.cumulativeWinRate), borderColor: "#34d399", backgroundColor: "#34d399", spanGaps: false, tension: 0, pointRadius: 4 },
                ] }} options={options(false, true, cumulativeTooltip)} /></div>}
        </section>
        <section className="stat-chart-panel"><h2>월별 포지션 참여도</h2>
            <div className="streamer-monthly-canvas"><Bar aria-label="월별 포지션 참여도" role="img" data={{ labels, datasets: POSITIONS.map((position, i) => ({
                label: position, data: months.map((m) => m.positions[position]), backgroundColor: COLORS[i],
            })) }} options={options(true)} /></div>
        </section>
        <section className="stat-chart-panel"><h2>연간 포지션 참여 비중</h2>
            <div className="streamer-monthly-canvas"><Doughnut aria-label="연간 포지션 참여 비중" role="img"
                data={{ labels: POSITIONS, datasets: [{ data: POSITIONS.map((position) => positions[position]), backgroundColor: COLORS, borderWidth: 0 }] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend, tooltip: { callbacks: {
                    label: (context) => `${context.label}: ${context.raw}경기 (${(100 * context.raw / summary.participationCount).toFixed(1)}%)`,
                } } } }} /></div>
        </section>
    </div>;
}
