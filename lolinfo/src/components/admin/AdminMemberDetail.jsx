import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaUserSlash, FaSave } from 'react-icons/fa';

export default function AdminMemberDetail() {
    const { memberId } = useParams();
    const navigate = useNavigate();

    
    
    const [member, setMember] = useState(null);
    const [activeTab, setActiveTab] = useState('quiz');

    const [loading, setLoading] = useState(true);

    // 데이터 로드
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);

            try {

                //요청 전송
                const res = await axios.get(`/admin/members/${memberId}`);
                setMember(res.data);

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                
                await Swal.fire({
                    icon: 'error',
                    title: '정보 로드 실패',
                    text: '회원 정보를 불러올 수 없습니다. (로그인 만료 가능성)',
                });
                navigate('/admin/member');
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchDetail();
        }
    }, [memberId, navigate]);

    // 등급 변경
    const handleGradeChange = async (e) => {
        const newGrade = e.target.value;

        try {
            await axios.patch(
                `/admin/members/${memberId}/grade?grade=${newGrade}`);

            Swal.fire({
                icon: 'success',
                title: '등급 변경 완료',
                text: `회원 등급이 [${newGrade}](으)로 변경되었습니다.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });

            setMember(prev => ({ ...prev, memberLevel: newGrade }));

        } catch (error) {
            console.error("등급 변경 에러", error);
            Swal.fire('오류', '등급 변경 중 문제가 발생했습니다.', 'error');
        }
    };

    const handleForceWithdrawal = async () => {
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
                 await axios.delete(`/admin/members/${memberId}`);
                 Swal.fire('추방 완료', '회원이 삭제되었습니다.', 'success');
                 navigate('/admin/member'); // 목록으로 이동
             } catch (error) {
                 Swal.fire('오류', '삭제 실패', 'error');
             }
         }
    };

    //대기 화면
    if (loading || !member) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-white text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5>회원 정보를 불러오는 중입니다...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-detail-container text-white">
            
            {/* 상단 헤더 */}
            <div className="d-flex align-items-center flex-wrap gap-3 mb-4 border-bottom border-secondary pb-3">
                <button className="btn btn-outline-light d-flex align-items-center gap-2 text-nowrap"
                        onClick={() => navigate('/admin/member')}>
                    <FaArrowLeft /> 
                    <span>목록으로</span>
                </button>
                <h3 className="mb-0 fw-bold text-nowrap">
                    👤 회원 상세 정보
                </h3>
            </div>

            {/* 프로필 요약 & 관리 카드 */}
            <div className="row mb-4">

                {/* 상세 정보와 탈퇴 버튼 */}
                {/* PC: 좌우 배치/ 모바일: 상하 배치 */}

                <div className="col-12">
                    <div className="card bg-dark border-secondary shadow-sm">
                        <div className="card-body p-4">
                            
                            {/* 닉네임과 아이디 */}
                            <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end mb-4 pb-3 border-bottom border-secondary gap-1 gap-md-3">
                                <h2 className="fw-bold text-white mb-0" style={{fontSize: '2rem'}}>
                                    {member.memberNickname}
                                </h2>
                                <span className="text-white pb-1 fs-5">
                                    ID: {member.memberId}
                                </span>
                            </div>

                            {/* 상세 정보 리스트 */}
                            <div className="row">
                                <div className="col-12">
                                    <ul className="list-group list-group-flush rounded">
                                        
                                        {/* 가입일 */}
                                        <li className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center px-0">
                                            <span className="text-secondary fw-bold">가입일</span>
                                            <span>{new Date(member.memberJoin).toLocaleDateString()}</span>
                                        </li>
                                        
                                        {/* 포인트 */}
                                        <li className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center px-0">
                                            <span className="text-secondary fw-bold">포인트</span>
                                            <span className="text-warning fw-bold">
                                                {member.memberPoint ? member.memberPoint.toLocaleString() : 0} P
                                            </span>
                                        </li>
                                        
                                        {/* 회원 관리 */}
                                        <li className="list-group-item bg-dark text-white border-secondary d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-bottom-0 px-0 pt-3">
                                            
                                            <span className="text-secondary fw-bold mb-2 mb-md-0">회원 관리</span>
                                            
                                            {/* 오른쪽 컨트롤 영역 */}
                                            <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
                                                
                                                {/* (1) 등급 변경 셀렉트 */}
                                                <select 
                                                    className={`form-select form-select-sm bg-secondary text-white border-0 fw-bold flex-grow-1 flex-md-grow-0
                                                        ${member.memberLevel === '관리자' ? 'text-danger' : 
                                                          member.memberLevel === '우수회원' ? 'text-info' : ''}`}
                                                    value={member.memberLevel}
                                                    onChange={handleGradeChange}
                                                    style={{ minWidth: '90px' }}
                                                >
                                                    <option value="관리자">관리자</option>
                                                    <option value="우수회원">우수회원</option>
                                                    <option value="일반회원">일반회원</option>
                                                </select>

                                                {/* 강제 탈퇴 버튼 */}
                                                <button 
                                                    className="btn btn-danger btn-sm fw-bold d-flex align-items-center justify-content-center gap-1 text-nowrap flex-grow-1 flex-md-grow-0" 
                                                    onClick={handleForceWithdrawal}
                                                >
                                                    <FaUserSlash /> 강제 탈퇴
                                                </button>
                                            </div>
                                        </li>

                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 활동 상세 내역 탭 */}
            <div className="row">
                <div className="col-12">
                    <div className="card bg-dark border-secondary shadow-sm">
                        <div className="card-header border-secondary bg-transparent">
                            <ul className="nav nav-tabs card-header-tabs border-0">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link border-0 ${activeTab === 'quiz' ? 'active bg-secondary text-white' : 'text-secondary'}`}
                                        onClick={() => setActiveTab('quiz')}>
                                        만든 퀴즈
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link border-0 ${activeTab === 'review' ? 'active bg-secondary text-white' : 'text-secondary'}`}
                                        onClick={() => setActiveTab('review')}>
                                        작성 리뷰
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link border-0 ${activeTab === 'report' ? 'active bg-secondary text-white' : 'text-secondary'}`}
                                        onClick={() => setActiveTab('report')}>
                                        신고 내역
                                    </button>
                                </li>
                            </ul>
                        </div>
                        
                        {/* 탭 내용 영역 */}
                        <div className="card-body d-flex flex-column" style={{ minHeight: '500px', maxHeight: '800px', overflowY: 'auto' }}>
                            {activeTab === 'quiz' && (
                                <div className="d-flex flex-column h-100">
                                    <h5 className="mb-3">❓ 등록한 퀴즈 목록</h5>
                                    <div className="alert alert-secondary bg-opacity-10 border-0 text-white flex-grow-1 d-flex flex-column justify-content-center align-items-center m-0">
                                        <div className="fs-1 text-secondary mb-3">📭</div>
                                        <h5>아직 등록한 퀴즈가 없습니다.</h5>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'review' && (
                                <div className="d-flex flex-column h-100">
                                    <h5 className="mb-3">📝 작성한 리뷰 목록</h5>
                                    <div className="alert alert-secondary bg-opacity-10 border-0 text-white flex-grow-1 d-flex flex-column justify-content-center align-items-center m-0">
                                        <div className="fs-1 text-secondary mb-3">📭</div>
                                        <h5>아직 작성한 리뷰가 없습니다.</h5>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'report' && (
                                <div className="d-flex flex-column h-100">
                                    <h5 className="mb-3 text-danger">🚨 신고 당한 기록</h5>
                                    <div className="alert alert-secondary bg-opacity-10 border-0 text-white flex-grow-1 d-flex flex-column justify-content-center align-items-center m-0">
                                        <div className="fs-1 text-danger mb-3">🚨</div>
                                        <h5>신고 내역이 없습니다.</h5>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}