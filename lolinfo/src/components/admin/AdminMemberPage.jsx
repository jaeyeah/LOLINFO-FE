import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAtomValue } from 'jotai';
import { loginIdState } from '../../utils/jotai';
import './AdminMember.css';
import Pagination from "../Pagination";

// 등급 목록 상수
const GRADE_OPTIONS = ["일반회원", "우수회원", "관리자"];

export default function AdminMemberPage() {

    const loginId = useAtomValue(loginIdState);
    const navigate = useNavigate(); // 이동 함수

    // 상태 관리
    const [memberList, setMemberList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });


    // 검색 필터 상태
    const [searchType, setSearchType] = useState('memberId');
    const [keyword, setKeyword] = useState('');

    // 1. 회원 목록 불러오기 (검색 포함)
    const fetchMembers = useCallback(async () => {
        if (!loginId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/admin/members`, {
                params: {
                    page : page,
                    type: searchType,
                    keyword: keyword
                }
            });
            setMemberList(res.data.list);
            setPageData(res.data.pageVO);
        } catch (error) {
            console.error("회원 목록 로드 실패", error);
        }
        setLoading(false);
    }, [loginId, searchType, keyword, page]);

    // 초기 로딩
    useEffect(() => {
        // 로그인 정보가 있으면 로드
        if (loginId) fetchMembers();
    }, [loginId, page]);

    // 2. 상세 페이지 이동 핸들러
    const handleRowClick = (memberId) => {
        navigate(`/admin/member/${memberId}`);
    };

    // 3. 등급 변경 핸들러 (리스트에서 바로 변경)
    const handleGradeChange = async (targetId, newGrade, e) => {
        e.stopPropagation();

        try {
            await axios.patch(`/admin/members/${targetId}/memberLevel?memberLevel=${newGrade}`
            );

            Swal.fire({
                icon: 'success',
                title: '등급 변경 완료',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });

            fetchMembers();
        } catch (error) {
            console.error(error);
            Swal.fire('오류', '등급 변경에 실패했습니다.', 'error');
        }
    };

    // 4. 강제 탈퇴 핸들러
    const handleForceWithdrawal = async (targetId, e) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: '회원 영구 추방',
            text: "정말 이 회원을 탈퇴 처리하시겠습니까?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네, 추방합니다',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/admin/members/${targetId}`)

                Swal.fire('추방 완료', '회원이 삭제되었습니다.', 'success');
                fetchMembers();
            } catch (error) {
                console.error(error);
                Swal.fire('오류', '삭제 실패', 'error');
            }
        }
    };

    // 등급별 뱃지 색상 클래스
    const getGradeClass = (grade) => {
        switch(grade) {
            case '관리자': return 'grade-admin';
            case '우수회원': return 'grade-excellent';
            default: return 'grade-general';
        }
    };

    return (
        <div className="admin-member-container text-white">
            <h3 className="fw-bold mb-4">👥 회원 관리</h3>

            {/* --- 1. 검색창 영역 --- */}
            <div className="member-search-box d-flex gap-2 mb-3 p-3 bg-dark border border-secondary rounded">
                <select
                    className="form-select w-auto bg-dark text-white border-secondary"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="memberId">아이디</option>
                    <option value="memberNickname">닉네임</option>
                    <option value="memberLevel">등급</option>
                </select>

                <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="검색어를 입력하세요..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && fetchMembers()}
                />

                <button className="btn btn-primary" onClick={fetchMembers}>
                    🔍 검색
                </button>
            </div>

            {/* --- 2. 회원 목록 테이블 --- */}
            <div className="admin-table-container">
                <table className="admin-table w-100 text-center">
                    <thead>
                        <tr className="bg-secondary text-white bg-opacity-25">
                            <th className="p-3">아이디</th>
                            <th className="p-3">닉네임</th>
                            <th className="p-3">가입일</th>
                            <th className="p-3">등급 관리</th>
                            <th className="p-3">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="py-5">데이터 로딩 중...</td></tr>
                        ) : memberList.length === 0 ? (
                            <tr><td colSpan="5" className="py-5 text-white">검색 결과가 없습니다.</td></tr>
                        ) : (
                            memberList.map((member) => (
                                <tr
                                    key={member.memberId}
                                    onClick={() => handleRowClick(member.memberId)} // 클릭 시 상세이동
                                    className="border-bottom border-secondary member-row"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="p-3">{member.memberId}</td>
                                    <td className="p-3">{member.memberNickname}</td>
                                    <td className="p-3">{new Date(member.memberJoin).toLocaleDateString()}</td>

                                    {/* 등급 변경 (이벤트 전파 방지 필수) */}
                                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            className={`form-select form-select-sm w-auto mx-auto border-0 fw-bold text-center 
                                                ${member.memberLevel === '관리자' ? 'text-danger' :
                                                member.memberLevel === '우수회원' ? 'text-primary' : 'text-white'}`}
                                            style={{ backgroundColor: '#2c2c2c' }}
                                            value={member.memberLevel}
                                            onChange={(e) => handleGradeChange(member.memberId, e.target.value, e)}
                                        >
                                            {GRADE_OPTIONS.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* 탈퇴 버튼 */}
                                    <td className="p-3">
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={(e) => handleForceWithdrawal(member.memberId, e)}
                                        >
                                            추방
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* 페이지네이션 */}
            <div className ="row mt-1">
                <div className="col-6 offset-3">
                        <Pagination
                        page={page}
                        totalPage={pageData.totalPage}
                        blockStart={pageData.blockStart}
                        blockFinish={pageData.blockFinish}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
}