import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminMain.css';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const featureColumns = [
    { key: 'tournamentList', label: '대회 목록' },
    { key: 'tournamentDetail', label: '대회 상세' },
    { key: 'streamerList', label: '스트리머 목록' },
    { key: 'streamerDetail', label: '스트리머 상세' },
    { key: 'ckStreamer', label: '스트리머 CK' },
    { key: 'ckList', label: 'CK 목록' },
    { key: 'teammate', label: '팀메이트' },
    { key: 'ranking', label: '랭킹' },
];

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const defaultYear = String(now.getFullYear());


export default function AdminVisitUsePage() {
    const [useData, setUseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [mode, setMode] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedYear, setSelectedYear] = useState(defaultYear);

    const chartUseData = [...useData].sort((a, b) =>
        a.useDate > b.useDate ? 1 : a.useDate < b.useDate ? -1 : 0
    );

    const labels = chartUseData.map((row) => {
        if (mode === 'year') {
            return `${row.useDate.slice(5, 7)}월`;
        }

        return `${Number(row.useDate.slice(8, 10))}일`;
    });

    const totalChartData = {
        labels,
        datasets: [
            {
                label: '총 이용 횟수',
                data: chartUseData.map((row) =>
                    featureColumns.reduce(
                        (sum, col) => sum + row[col.key],
                        0
                    )
                ),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: mode === 'month' ? 3 : 4,
                pointHoverRadius: 6
            }
        ]
    };

    const featureColors = [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#a855f7'
    ];

    const featureChartData = {
        labels,

        datasets: featureColumns.map((col, index) => ({
            label: col.label,
            data: chartUseData.map((row) => row[col.key]),
            borderColor: featureColors[index],
            backgroundColor: featureColors[index],
            tension: 0.3,
            borderWidth: 2,
            pointRadius: mode === 'month' ? 2 : 3,
            pointHoverRadius: 5,
            fill: false
        }))
    };
    const baseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            mode: 'index',
            intersect: false
        },

        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.dataset.label}: ${context.raw.toLocaleString()}회`
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: '#aaa'
                },
                grid: {
                    color: 'rgba(255,255,255,0.05)'
                }
            },

            y: {
                beginAtZero: true,
                ticks: {
                    color: '#aaa',
                    precision: 0
                },
                grid: {
                    color: 'rgba(255,255,255,0.08)'
                }
            }
        }
    };

    const totalChartOptions = {
        ...baseChartOptions,
        plugins: {
            ...baseChartOptions.plugins,
            legend: {
                display: false
            }
        }
    };

    const featureChartOptions = {
        ...baseChartOptions,
        plugins: {
            ...baseChartOptions.plugins,
            legend: {
                display: true,
                labels: {
                    color: '#ddd',
                    usePointStyle: true,
                    padding: 14
                }
            }
        }
    };
    const fetchUseData = async (queryMode = mode) => {
        setLoading(true);
        setError(null);

        try {
            const queryValue = queryMode === 'year' ? selectedYear : selectedMonth;
            const endpoint = queryMode === 'year' ? `/visit/use/year?year=${queryValue}`
                : `/visit/use/month?month=${queryValue}`;
            const res = await axios.get(endpoint);
            const data = Array.isArray(res.data) ? res.data : [];
            const normalized = data.map((item) => ({
                useDate: item.useDate ?? '',
                tournamentList: Number(item.tournamentList ?? 0),
                tournamentDetail: Number(item.tournamentDetail ?? 0),
                streamerList: Number(item.streamerList ?? 0),
                streamerDetail: Number(item.streamerDetail ?? 0),
                ckStreamer: Number(item.ckStreamer ?? 0),
                ckList: Number(item.ckList ?? 0),
                teammate: Number(item.teammate ?? 0),
                ranking: Number(item.ranking ?? 0),
            }));

            setUseData(normalized);
        } catch (err) {
            console.error('기능 이용 통계 조회 실패', err);
            setError('기능 이용 통계 조회에 실패했습니다.');
            setUseData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUseData(mode);
    }, [mode]);

    return (
        <div className="admin-member-container admin-visit-use-page text-white">
            <h3 className="fw-bold mb-4">📊 기능별 이용 통계</h3>

            {/* 월간 / 연간 조회 */}
            <div className="admin-visit-filter d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                <div className="btn-group" role="group" aria-label="조회 모드 선택">
                    <button type="button" className={`btn btn-sm ${mode === 'month' ? 'btn-primary' : 'btn-outline-light'}`}
                        onClick={() => setMode('month')}  >
                        월간
                    </button>
                    <button type="button" className={`btn btn-sm ${mode === 'year' ? 'btn-primary' : 'btn-outline-light'}`}
                        onClick={() => setMode('year')} >
                        연간
                    </button>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2 admin-visit-input-row">
                    {mode === 'month' ? (
                        <label className="mb-0 text-nowrap">
                            <input className="form-control form-control-sm ms-2" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                        </label>
                    ) : (
                        <label className="mb-0 text-nowrap">
                            <input className="form-control form-control-sm ms-2" type="number" min="1900" max="2100" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} />
                        </label>
                    )}
                    <button className="ms-1 btn btn-sm btn-light" type="button" onClick={() => fetchUseData(mode)}>
                        조회
                    </button>
                </div>
            </div>

            {loading ? (
                <div>기능 이용 통계를 불러오는 중입니다...</div>
            ) : error ? (
                <div className="text-danger">{error}</div>
            ) : (
                <>
                    <div className="admin-visit-chart mb-4">
                        <div className="admin-visit-chart-header mb-3">
                            <h5 className="fw-bold mb-1">
                                {mode === 'month'
                                    ? '일별 총 이용 횟수'
                                    : '월별 총 이용 횟수'}
                            </h5>

                            <small className="text-secondary">
                                전체 기능 이용량 합계
                            </small>
                        </div>

                        <div className="admin-visit-chart-body">
                            <Line
                                data={totalChartData}
                                options={totalChartOptions}
                            />
                        </div>
                    </div>

                    <div className="admin-visit-chart">
                        <div className="admin-visit-chart-header mb-3">
                            <h5 className="fw-bold mb-1">
                                {mode === 'month'
                                    ? '일별 기능 이용 추이'
                                    : '월별 기능 이용 추이'}
                            </h5>

                            <small className="text-secondary">
                                기능별 이용 횟수 비교
                            </small>
                        </div>

                        <div className="admin-visit-chart-body">
                            <Line
                                data={featureChartData}
                                options={featureChartOptions}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
