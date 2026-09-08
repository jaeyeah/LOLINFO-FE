import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminMain.css';
import {Chart as ChartJS, CategoryScale,
    LinearScale, PointElement, LineElement, BarElement,Title,
    Tooltip,Legend,Filler} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const defaultYear = String(now.getFullYear());

export default function AdminVisitPage() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedYear, setSelectedYear] = useState(defaultYear);

    const normalizeVisit = (visit) => {
        const visitCount = Number(visit.visitCount ?? visit.visitorCount ?? 0);
        const visitLogin = Number(visit.visitLogin ?? visit.loginVisitorCount ?? 0);

        return {
            visitDate: visit.visitDate ?? visit.date ?? '',
            visitCount,
            visitLogin
        };
    };

    const fetchVisits = async (queryMode = mode) => {
        setLoading(true);
        setError(null);
        try {
            const queryValue = queryMode === 'year' ? selectedYear : selectedMonth;
            const endpoint = queryMode === 'year' ? `/visit/year?year=${queryValue}` : `/visit/month?month=${queryValue}`;
            const res = await axios.get(endpoint);
            let data = res.data || [];

            const normalized = data
                .map(normalizeVisit)
                .slice()
                .sort((a, b) => (a.visitDate > b.visitDate ? -1 : a.visitDate < b.visitDate ? 1 : 0));

            setVisits(normalized);
        } catch (err) {
            console.error('방문 통계 조회 실패', err);
            setError('방문 통계 조회에 실패했습니다.');
            setVisits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisits(mode);
    }, [mode]);

    const formatDate = (value, mode) => {
        if (!value) return '';
        if (mode === 'year') {
            return `${value.slice(2, 4)}년 ${value.slice(5, 7)}월`;
        }
        return `${value.slice(2, 4)}년 ${value.slice(5, 7)}/${value.slice(8, 10)}`;
    };
    const maxVisitCount = Math.max(...visits.map((v) => v.visitCount || 0), 1);

    //chart.js 적용
    const chartVisits = [...visits].reverse();
    const chartData = {
        labels: chartVisits.map((v) => {
            if (mode === 'year') {
                return `${v.visitDate.slice(5, 7)}월`;
            }

            return `${Number(v.visitDate.slice(8, 10))}일`;
        }),

        datasets: [
            {
                label: '전체 방문자',
                data: chartVisits.map((v) => v.visitCount),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                tension: 0.3,
                fill: true,
                pointRadius: mode === 'month' ? 3 : 4,
                pointHoverRadius: 6,
                borderWidth: 2
            },
            {
                label: '로그인 방문자',
                data: chartVisits.map((v) => v.visitLogin),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                tension: 0.3,
                fill: false,
                pointRadius: mode === 'month' ? 2 : 4,
                pointHoverRadius: 6,
                borderWidth: 2
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {mode: 'index', intersect: false},
        plugins: {
            legend: {
                labels: { color: '#ddd', usePointStyle: true}
            },
            tooltip: {
                callbacks: { label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}명`}
            }
        },
        scales: {
            x: {ticks: {color: '#aaa' },grid: {  color: 'rgba(255,255,255,0.05)'}},
            y: {beginAtZero: true,
                ticks: {color: '#aaa', precision: 0 },
                grid: {color: 'rgba(255,255,255,0.08)'}
            }
        }
    };

    return (
        <div className="admin-member-container text-white">
            <h3 className="fw-bold mb-4">📈 방문 통계</h3>

            <div className="admin-visit-filter d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                <div className="btn-group" role="group" aria-label="조회 모드 선택">
                    <button type="button" className={`btn btn-sm ${mode === 'month' ? 'btn-primary' : 'btn-outline-light'}`}
                        onClick={() => setMode('month')}  >
                        월간
                    </button>
                    <button type="button"  className={`btn btn-sm ${mode === 'year' ? 'btn-primary' : 'btn-outline-light'}`}
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
                    <button className="ms-1 btn btn-sm btn-light" type="button" onClick={() => fetchVisits(mode)}>
                        조회
                    </button>
                </div>
            </div>

            {loading ? (
                <div>방문 통계를 불러오는 중입니다...</div>
            ) : error ? (
                <div className="text-danger">{error}</div>
            ) : (
                <>
                {visits.length > 0 && (
                    <div className="admin-visit-chart mb-4">
                        <div className="admin-visit-chart-header mb-3">
                            <h5 className="fw-bold mb-1">
                                {mode === 'month'
                                    ? '일별 방문자 추이'
                                    : '월별 방문자 추이'}
                            </h5>

                            <small className="text-secondary">
                                전체 방문자 및 로그인 방문자
                            </small>
                        </div>

                        <div className="admin-visit-chart-body">
                            {mode === 'month' ? (
                                <Line
                                    data={chartData}
                                    options={chartOptions}
                                />
                            ) : (
                                <Bar
                                    data={chartData}
                                    options={chartOptions}
                                />
                            )}
                        </div>
                    </div>
                )}
            </>)}
        </div>
    );
}
