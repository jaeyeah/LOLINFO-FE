import { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Chart } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "./Stat.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const BAR_DATASET_INDEX = 2;
const DEFAULT_TOURNAMENT_BAR_COLOR = "rgba(251, 191, 36, 0.72)";
const DEFAULT_TOURNAMENT_BORDER_COLOR = "#fbbf24";
const MELMANG_TOURNAMENT_BAR_FALLBACK_COLOR = "rgba(168, 85, 247, 0.78)";
const MELMANG_TOURNAMENT_BORDER_COLOR = "#a855f7";
const MELMANG_GRADIENT_START_COLOR = "#6d28d9";
const MELMANG_GRADIENT_END_COLOR = "#c084fc";

function createMyeolmangGradient(chart, startColor, endColor) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return MELMANG_TOURNAMENT_BAR_FALLBACK_COLOR;

    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
}
const MELMANG_BADGE_PLUGIN = {
    id: "myeolmangTournamentBadge",
    afterDatasetsDraw(chart, _args, options) {
        const months = options.months ?? [];
        const barMeta = chart.getDatasetMeta(BAR_DATASET_INDEX);
        const { ctx } = chart;

        ctx.save();
        ctx.font = "600 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        barMeta.data.forEach((bar, index) => {
            if (!includesMyeolmangTournament(months[index])) return;

            const badgeWidth = 44;
            const badgeHeight = 20;
            const badgeX = bar.x - badgeWidth / 2;
            const badgeY = Math.max(chart.chartArea.top, bar.y - badgeHeight - 6);

            const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY + badgeHeight);
            badgeGradient.addColorStop(0, MELMANG_GRADIENT_START_COLOR);
            badgeGradient.addColorStop(1, MELMANG_GRADIENT_END_COLOR);
            ctx.fillStyle = badgeGradient;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillText("멸망전", bar.x, badgeY + badgeHeight / 2);
        });

        ctx.restore();
    },
};

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
    const monthIndex = dataPoint?.dataIndex ?? pinnedMonthIndex;
    if (monthIndex == null) {
        tooltipElement.style.opacity = "0";
        return;
    }

    const month = months[monthIndex];
    const pinnedBar = chart.getDatasetMeta(BAR_DATASET_INDEX).data[monthIndex];
    if (!month || (!dataPoint && !pinnedBar)) {
        tooltipElement.style.opacity = "0";
        return;
    }

    const tournaments = month?.tournaments ?? [];
    tooltipElement.replaceChildren();

    const title = document.createElement("strong");
    if (hoveredBar || (!dataPoint && pinnedBar)) {
        title.textContent = `${month.month}월 대회 ${tournaments.length}건`;
    } else {
        title.textContent = `${month.month}월 ${dataPoint.dataset.label}`;
    }
    tooltipElement.appendChild(title);

    if (hoveredBar || (!dataPoint && pinnedBar)) {
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
    } else {
        const value = document.createElement("span");
        const unit = dataPoint.datasetIndex === 1 ? "명" : "건";
        value.textContent = `${Number(dataPoint.raw).toLocaleString()}${unit}`;
        tooltipElement.appendChild(value);
    }

    const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipElement;
    const caretX = dataPoint ? tooltip.caretX : pinnedBar.x;
    const caretY = dataPoint ? tooltip.caretY : pinnedBar.y;
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
    const chartContainerRef = useRef(null);
    const [pinnedMonthIndex, setPinnedMonthIndex] = useState(null);

    useEffect(() => {
        const handleDocumentPointerDown = (event) => {
            const tooltipElement = chartContainerRef.current?.querySelector(".monthly-activity-tooltip");
            if (tooltipElement?.contains(event.target)) return;

            setPinnedMonthIndex(null);
            if (tooltipElement) tooltipElement.style.opacity = "0";
        };

        document.addEventListener("pointerdown", handleDocumentPointerDown);
        return () => document.removeEventListener("pointerdown", handleDocumentPointerDown);
    }, []);

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
                backgroundColor: (context) => {
                    const month = months[context.dataIndex];
                    return month && includesMyeolmangTournament(month)
                        ? createMyeolmangGradient(
                            context.chart,
                            MELMANG_GRADIENT_START_COLOR,
                            MELMANG_GRADIENT_END_COLOR
                        )
                        : DEFAULT_TOURNAMENT_BAR_COLOR;
                },
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
                myeolmangTournamentBadge: { months },
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
        <div ref={chartContainerRef} className="monthly-activity-chart">
            <Chart
                type="bar"
                data={chartData}
                options={chartOptions}
                plugins={[MELMANG_BADGE_PLUGIN]}
                onClick={(_event, elements) => {
                    const barElement = elements.find((element) => element.datasetIndex === BAR_DATASET_INDEX);
                    setPinnedMonthIndex(barElement ? barElement.index : null);
                }}
            />
        </div>
    );
}
