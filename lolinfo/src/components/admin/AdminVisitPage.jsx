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
        try {
            const iso = new Date(d).toISOString();
            return iso.slice(0, 10);
        } catch (e) {
            return d;
        }
    };

    return (
        <div className="admin-member-container text-white">
            <h3 className="fw-bold mb-4">📈 방문 통계</h3>

            {loading ? (
                <div>방문 통계를 불러오는 중입니다...</div>
            ) : error ? (
                <div className="text-danger">{error}</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table w-100 text-center">
                        <thead>
                            <tr className="bg-secondary text-white bg-opacity-25">
                                <th className="p-3">날짜</th>
                                <th className="p-3">전체 방문자 수</th>
                                <th className="p-3">로그인 방문자 수</th>
                                <th className="p-3">비로그인 방문자 수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visits.length === 0 ? (
                                <tr><td colSpan="4" className="py-5 text-white">데이터가 없습니다.</td></tr>
                            ) : (
                                visits.map((v, idx) => {
                                    const nonLogin = (v.visitorCount || 0) - (v.loginVisitorCount || 0);
                                    return (
                                        <tr key={idx} className="border-bottom border-secondary">
                                            <td className="p-3">{formatDate(v.visitDate)}</td>
                                            <td className="p-3">{v.visitorCount ?? 0}</td>
                                            <td className="p-3">{v.loginVisitorCount ?? 0}</td>
                                            <td className="p-3">{nonLogin}</td>
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
