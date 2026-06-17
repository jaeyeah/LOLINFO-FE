import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminMain.css';

export default function AdminVisitPage() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVisits = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get('/visit/');
                let data = res.data || [];
                console.log('방문 통계 데이터:', data);
                // Ensure recent dates appear first if backend not sorted
                data = data.slice().sort((a, b) => (a.visitDate > b.visitDate ? -1 : a.visitDate < b.visitDate ? 1 : 0));

                setVisits(data);
            } catch (err) {
                console.error('방문 통계 조회 실패', err);
                setError('방문 통계 조회에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, []);

    const formatDate = (d) => {
        if (!d) return '';
        
        const date = new Date(d);
        const year = String(date.getFullYear()).slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}년 ${month}/${day}`;
    };
    const maxVisitCount = Math.max(
        ...visits.map(v => v.visitCount || 0),1
    );

    return (
        <div className="admin-member-container text-white">
            <h3 className="fw-bold mb-4">📈 방문 통계</h3>

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
                                <tr><td colSpan="4" className="py-5 text-white">데이터가 없습니다.</td></tr>
                            ) : (
                                visits.map((v, idx) => {
                                    return (
                                        <tr key={idx} className="border-bottom border-secondary">
                                            <td className="p-3">{formatDate(v.visitDate)}</td>
                                            <td className="p-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span style={{ minWidth: "50px" }}>{v.visitCount ?? 0}</span>
                                                    <div className="progress flex-grow-1" style={{ height: "20px", minWidth: "120px" }} >
                                                        <div className="progress-bar bg-success" role="progressbar"style={{width: `${((v.visitCount || 0) / maxVisitCount) * 100}%` }}> </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">{v.visitLogin ?? 0}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
