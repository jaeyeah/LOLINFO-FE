import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './AdminMain.css';

const featureColumns = [
    { key: 'tournamentList', label: '대회 목록' },
    { key: 'tournamentDetail', label: '대회 상세' },
    { key: 'streamerList', label: '스트리머 목록' },
    { key: 'streamerDetail', label: '스트리머 상세' },
    { key: 'ckStreamer', label: '스트리머 CK' },
    { key: 'ckList', label: 'CK 목록' },
    { key: 'teammate', label: '팀메이트' },
];

const formatUseDate = (value, mode) => {
    if (!value) return '';
    const text = String(value);
    if (mode === 'year') {
        return `${text.slice(2, 4)}년 ${text.slice(5, 7)}월`;
    }
    return `${text.slice(2, 4)}년 ${text.slice(5, 7)}/${text.slice(8, 10)}`;
};
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

    const totalCount = useMemo(() => {
        return useData.reduce((sum, row) => {
            return sum + featureColumns.reduce((subSum, col) => subSum + row[col.key], 0);
        }, 0);
    }, [useData]);

    const maxCount = useMemo(() => {
        return Math.max(
            ...useData.flatMap((row) => featureColumns.map((col) => row[col.key] || 0)),
            1
        );
    }, [useData]);

    return (
         <div className="admin-member-container text-white">
            <h3 className="fw-bold mb-4">📊 기능별 이용 통계</h3>

            {/* 월간 / 연간 조회 */}
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
                    <button className="ms-1 btn btn-sm btn-light" type="button" onClick={() => fetchUseData(mode)}>
                        조회
                    </button>
                </div>
            </div>


            <div className="admin-use-summary d-flex flex-wrap gap-3 mb-4">
                <div className="admin-use-summary-card">
                    <div className="text-secondary">기록된 기능 수</div>
                    <strong>{featureColumns.length}개</strong>
                </div>
                <div className="admin-use-summary-card">
                    <div className="text-secondary">총 이용 횟수</div>
                    <strong>{totalCount}회</strong>
                </div>
            </div>

            {loading ? (
                <div>기능 이용 통계를 불러오는 중입니다...</div>
            ) : error ? (
                <div className="text-danger">{error}</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-use-table w-100 text-center">
                        <thead>
                            <tr className="bg-secondary text-white bg-opacity-25">
                                <th className="p-3">날짜</th>
                                {featureColumns.map((col) => (
                                    <th key={col.key} className="p-3">{col.label}</th>
                                ))}
                                <th className="p-3">일 합계</th>
                            </tr>
                        </thead>

                        <tbody>
                            {useData.length === 0 ? (
                                <tr>
                                    <td colSpan={featureColumns.length + 2} className="py-5 text-white">
                                        기능 이용 통계가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                useData.map((row, idx) => {
                                    const rowTotal = featureColumns.reduce(
                                        (sum, col) => sum + row[col.key],
                                        0
                                    );

                                    return (
                                        <tr key={idx} className="border-bottom border-secondary">
                                            <td className="p-3">{formatUseDate(row.useDate, mode)}</td>

                                            {featureColumns.map((col) => (
                                                <td key={col.key} className="p-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span style={{ minWidth: '35px' }}>
                                                            {row[col.key]}
                                                        </span>
                                                        <div
                                                            className="progress flex-grow-1"
                                                            style={{ height: '16px', minWidth: '80px' }}
                                                        >
                                                            <div className="progress-bar bg-danger" role="progressbar"
                                                                style={{
                                                                    width: `${((row[col.key] || 0) / maxCount) * 100}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            ))}

                                            <td className="p-3 fw-bold">{rowTotal}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
