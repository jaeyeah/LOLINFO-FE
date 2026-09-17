import { useMemo, useState } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Chart } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "./Stat.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const BAR_DATASET_INDEX = 2;
const DEFAULT_TOURNAMENT_BAR_COLOR = "rgba(251, 191, 36, 0.72)";
const DEFAULT_TOURNAMENT_BORDER_COLOR = "#fbbf24";
const MELMANG_TOURNAMENT_BAR_COLOR = "rgba(244, 114, 182, 0.78)";
const MELMANG_TOURNAMENT_BORDER_COLOR = "#f472b6";

function includesMyeolmangTournament(month) {
    return month.tournaments.some((tournament) =>
        String(tournament?.name ?? "").includes("멸망전")
    );
}

function renderTournamentTooltip({ chart, tooltip }, months, navigate, pinnedMonthIndex) {
    const container = chart.canvas.parentNode;
    let tooltipElement = container.querySelector(".monthly-activity-tooltip");

    if (!tooltipElement) {
        tooltipElement = document.createElement("div");
        tooltipElement.className = "monthly-activity-tooltip";
        container.appendChild(tooltipElement);
    }

    const dataPoint = tooltip.dataPoints?.[0];
    const hoveredBar = dataPoint?.datasetIndex === BAR_DATASET_INDEX ? dataPoint : null;
    const monthIndex = hoveredBar?.dataIndex ?? pinnedMonthIndex;
    if (monthIndex == null) {
        tooltipElement.style.opacity = "0";
        return;
    }

    const pinnedBar = chart.getDatasetMeta(BAR_DATASET_INDEX).data[monthIndex];
    if (!pinnedBar) {
        tooltipElement.style.opacity = "0";
        return;
    }

    const month = months[monthIndex];
    const tournaments = month?.tournaments ?? [];
    tooltipElement.replaceChildren();

    const title = document.createElement("strong");
    title.textContent = `${month?.month ?? dataPoint.dataIndex + 1}월 대회 ${tournaments.length}건`;
    tooltipElement.appendChild(title);

    if (tournaments.length > 0) {
        const list = document.createElement("ul");
        tournaments.forEach((tournament) => {
            const item = document.createElement("li");
            if (tournament?.id != null) {
                const link = document.createElement("a");
                link.href = `/tournament/${encodeURIComponent(tournament.id)}`;
                link.className = "monthly-activity-tooltip-link";
                link.textContent = tournament.name;
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    navigate(`/tournament/${encodeURIComponent(tournament.id)}`);
                });
                item.appendChild(link);
            } else {
                item.textContent = tournament.name;
            }
            list.appendChild(item);
        });
        tooltipElement.appendChild(list);
    }

    const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipElement;
    const caretX = hoveredBar ? tooltip.caretX : pinnedBar.x;
    const caretY = hoveredBar ? tooltip.caretY : pinnedBar.y;
    const left = Math.min(
        Math.max(8, caretX - tooltipWidth / 2),
        container.clientWidth - tooltipWidth - 8
    );
    const aboveTop = caretY - tooltipHeight - 12;
    const top = aboveTop >= 8 ? aboveTop : Math.min(caretY + 12, container.clientHeight - tooltipHeight - 8);

    tooltipElement.style.left = `${Math.max(8, left)}px`;
    tooltipElement.style.top = `${Math.max(8, top)}px`;
    tooltipElement.style.opacity = "1";
}

export default function MonthlyActivityChart({ months }) {
    const navigate = useNavigate();
    const [pinnedMonthIndex, setPinnedMonthIndex] = useState(null);

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
                backgroundColor: months.map((item) =>
                    includesMyeolmangTournament(item)
                        ? MELMANG_TOURNAMENT_BAR_COLOR
                        : DEFAULT_TOURNAMENT_BAR_COLOR
                ),
                borderColor: months.map((item) =>
                    includesMyeolmangTournament(item)
                        ? MELMANG_TOURNAMENT_BORDER_COLOR
                        : DEFAULT_TOURNAMENT_BORDER_COLOR
                ),
                borderWidth: 1,
                borderRadius: 3,
                base: 0,
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
                    external: (context) => renderTournamentTooltip(
                        context,
                        months,
                        navigate,
                        pinnedMonthIndex
                    ),
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
                    min: 0,
                    position: "left",
                    weight: 2,
                    ticks: { color: "#86efac", precision: 0 },
                    grid: { color: "rgba(255,255,255,0.08)" },
                },
                yParticipants: {
                    beginAtZero: true,
                    min: 0,
                    position: "left",
                    weight: 1,
                    ticks: { color: "#93c5fd", precision: 0 },
                    grid: { drawOnChartArea: false },
                },
                yTournaments: {
                    beginAtZero: true,
                    min: 0,
                    position: "right",
                    stacked: false,
                    suggestedMax: maxTournamentCount <= 1 ? 2 : undefined,
                    ticks: { color: "#fcd34d", precision: 0 },
                    grid: { drawOnChartArea: false },
                },
            },
        };
    }, [months, navigate, pinnedMonthIndex]);

    return (
        <Chart
            type="bar"
            data={chartData}
            options={chartOptions}
            onClick={(_event, elements) => {
                const barElement = elements.find((element) => element.datasetIndex === BAR_DATASET_INDEX);
                setPinnedMonthIndex(barElement ? barElement.index : null);
            }}
        />
    );
}
