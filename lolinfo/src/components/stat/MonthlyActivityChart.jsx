import { useMemo } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Chart } from "react-chartjs-2";
import "./Stat.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const BAR_DATASET_INDEX = 2;

function renderTournamentTooltip({ chart, tooltip }, months) {
    const container = chart.canvas.parentNode;
    let tooltipElement = container.querySelector(".monthly-activity-tooltip");

    if (!tooltipElement) {
        tooltipElement = document.createElement("div");
        tooltipElement.className = "monthly-activity-tooltip";
        container.appendChild(tooltipElement);
    }

    const dataPoint = tooltip.dataPoints?.[0];
    if (tooltip.opacity === 0 || !dataPoint || dataPoint.datasetIndex !== BAR_DATASET_INDEX) {
        tooltipElement.style.opacity = "0";
        return;
    }

    const month = months[dataPoint.dataIndex];
    const tournaments = month?.tournaments ?? [];
    tooltipElement.replaceChildren();

    const title = document.createElement("strong");
    title.textContent = `${month?.month ?? dataPoint.dataIndex + 1}월 대회 ${tournaments.length}건`;
    tooltipElement.appendChild(title);

    if (tournaments.length > 0) {
        const list = document.createElement("ul");
        tournaments.forEach((tournament) => {
            const item = document.createElement("li");
            item.textContent = tournament.name;
            list.appendChild(item);
        });
        tooltipElement.appendChild(list);
    }

    const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipElement;
    const left = Math.min(
        Math.max(8, tooltip.caretX - tooltipWidth / 2),
        container.clientWidth - tooltipWidth - 8
    );
    const aboveTop = tooltip.caretY - tooltipHeight - 12;
    const top = aboveTop >= 8 ? aboveTop : Math.min(tooltip.caretY + 12, container.clientHeight - tooltipHeight - 8);

    tooltipElement.style.left = `${Math.max(8, left)}px`;
    tooltipElement.style.top = `${Math.max(8, top)}px`;
    tooltipElement.style.opacity = "1";
}

export default function MonthlyActivityChart({ months }) {
    const chartData = useMemo(() => ({
        labels: months.map((item) => `${item.month}월`),
        datasets: [
            {
                type: "line",
                label: "월별 CK 경기 수",
                data: months.map((item) => item.ckCount),
                borderColor: "#22c55e",
                backgroundColor: "rgba(34, 197, 94, 0.12)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true,
                yAxisID: "yCk",
            },
            {
                type: "line",
                label: "월별 CK 참여 스트리머 수",
                data: months.map((item) => item.participantCount),
                borderColor: "#60a5fa",
                backgroundColor: "rgba(96, 165, 250, 0.1)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: false,
                yAxisID: "yParticipants",
            },
            {
                type: "bar",
                label: "월별 대회 수",
                data: months.map((item) => item.tournamentCount),
                backgroundColor: "rgba(251, 191, 36, 0.72)",
                borderColor: "#fbbf24",
                borderWidth: 1,
                borderRadius: 3,
                barPercentage: 0.52,
                categoryPercentage: 0.72,
                yAxisID: "yTournaments",
            },
        ],
    }), [months]);

    const chartOptions = useMemo(() => {
        const maxTournamentCount = Math.max(...months.map((item) => item.tournamentCount), 0);

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "nearest", intersect: true },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#ddd", usePointStyle: true, padding: 16 },
                },
                tooltip: {
                    enabled: false,
                    external: (context) => renderTournamentTooltip(context, months),
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}건`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: "#aaa", maxRotation: 0 },
                    grid: { color: "rgba(255,255,255,0.05)" },
                },
                yCk: {
                    beginAtZero: true,
                    position: "left",
                    ticks: { color: "#86efac", precision: 0 },
                    grid: { color: "rgba(255,255,255,0.08)" },
                },
                yParticipants: {
                    beginAtZero: true,
                    position: "right",
                    ticks: { color: "#93c5fd", precision: 0 },
                    grid: { drawOnChartArea: false },
                },
                yTournaments: {
                    beginAtZero: true,
                    position: "right",
                    offset: true,
                    suggestedMax: maxTournamentCount <= 1 ? 2 : undefined,
                    ticks: { color: "#fcd34d", precision: 0 },
                    grid: { drawOnChartArea: false },
                },
            },
        };
    }, [months]);

    return <Chart type="bar" data={chartData} options={chartOptions} />;
}
