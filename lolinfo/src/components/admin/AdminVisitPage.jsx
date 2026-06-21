import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminMain.css';

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
            console.log('방문 통계 데이터:', data);

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
                <div className="admin-table-container">
                    <table className="admin-visit-table w-100 text-center">
                        <thead>
                            <tr className="bg-secondary text-white bg-opacity-25">
                                <th className="p-3">날짜</th>
                                <th className="p-3">전체 방문자 수</th>
                                <th className="p-3">로그인 방문자 수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visits.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-5 text-white">
                                        방문 통계가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                visits.map((v, idx) => (
                                    <tr key={idx} className="border-bottom border-secondary">
                                        <td className="p-3">{formatDate(v.visitDate, mode)}</td>
                                        <td className="p-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ minWidth: '50px' }}>{v.visitCount}</span>
                                                <div className="progress flex-grow-1" style={{ height: '20px', minWidth: '120px' }}>
                                                    <div
                                                        className="progress-bar bg-success"
                                                        role="progressbar"
                                                        style={{ width: `${((v.visitCount || 0) / maxVisitCount) * 100}%` }}
                                                    >
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">{v.visitLogin}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
