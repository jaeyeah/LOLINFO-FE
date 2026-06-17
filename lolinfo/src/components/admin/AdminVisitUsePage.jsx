import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminMain.css';

const typeMap = {
    STREAMER_LIST: '스트리머 목록',
    STREAMER_DETAIL: '스트리머 상세',
    TOURNAMENT_LIST: '대회 목록',
    TOURNAMENT_DETAIL: '대회 상세',
    STREAMER_CK: '스트리머 CK',
    CK_LIST: 'CK 목록'
};

const formatUseDate = (value) => {
    if (!value) return '';

    const text = String(value);
    const year = text.slice(2, 4);
    const month = text.slice(5, 7);
    const day = text.slice(8, 10);

    return `${year}년 ${month}/${day}`;
};

export default function AdminVisitUsePage() {
    const [useData, setUseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUseData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/visit/use');
            const data = Array.isArray(res.data) ? res.data : [];
            console.log('기능별 이용 통계 데이터:', data);

            const normalized = data
                .map((item) => ({
                    useDate: item.useDate ?? '',
                    useType: item.useType ?? '',
                    useCount: Number(item.useCount ?? 0),
                }))
                .sort((a, b) => (b.useCount || 0) - (a.useCount || 0));

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
        fetchUseData();
    }, []);

    const maxCount = Math.max(...useData.map((item) => item.useCount || 0), 1);
    const uniqueFeatureCount = new Set(useData.map((item) => item.useType)).size;
    const totalCount = useData.reduce((sum, item) => sum + (item.useCount || 0), 0);

    return (
        <div className="admin-member-container text-white">
            <h3 className="fw-bold mb-4">📊 기능별 이용 통계</h3>

            <div className="admin-use-summary d-flex flex-wrap gap-3 mb-4">
                <div className="admin-use-summary-card">
                    <div className="text-secondary">기록된 기능 수</div>
                    <strong>{uniqueFeatureCount}개</strong>
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
                                <th className="p-3">기능</th>
                                <th className="p-3">이용 횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {useData.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="py-5 text-white">
                                        기능 이용 통계가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                useData.map((item, idx) => (
                                    <tr key={idx} className="border-bottom border-secondary">
                                        <td className="p-3">{formatUseDate(item.useDate)}</td>
                                        <td className="p-3">{typeMap[item.useType] ?? item.useType}</td>
                                        <td className="p-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ minWidth: '50px' }}>{item.useCount}</span>
                                                <div className="progress flex-grow-1" style={{ height: '20px', minWidth: '120px' }}>
                                                    <div
                                                        className="progress-bar bg-info"
                                                        role="progressbar"
                                                        style={{ width: `${((item.useCount || 0) / maxCount) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
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
