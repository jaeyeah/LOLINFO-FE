import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAtomValue, useSetAtom } from 'jotai';
import { clearLoginState, loginIdState } from '../../utils/jotai';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AdminMemberPage() {

    const loginId = useAtomValue(loginIdState);

    // 상태 관리
    const [member, setMember] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const clearLogin = useSetAtom(clearLoginState);

    // 1. 회원 목록 불러오기
    const loadData = async () => {
        if (!loginId) return;

        setLoading(true);
        try {
            const res = await axios.get(`/mypage/`);
            setMember(res.data);
            
        } catch (error) {
            console.error("회원 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };

    // 초기 로딩
    useEffect(() => {
        loadData();
    }, [loginId]);

     // 회원 탈퇴 핸들러
    const deleteMember = async (targetId, e) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: '회원 탈퇴',
            text: "정말 탈퇴 하시겠습니까?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete("/mypage/");
                Swal.fire('탈퇴 완료', '회원 탈퇴가 완료되었습니다.', 'success');
                //로그아웃 처리
                clearLogin();
                delete axios.defaults.headers.common['Authorization'];
                navigate("/");
            } catch (error) {
                console.error(error);
                Swal.fire('오류', '삭제 실패', 'error');
            }
        }
    };


    return (
        <div className="container-fluid">
            <div className="card bg-dark text-white border-secondary">
                <div className="card-header">
                    <h4 className="mb-0">👤 회원 정보</h4>
                </div>

                <div className="row card-body">
                    <div className="col-10">
                        <div className="row mb-3">
                            <div className="col-md-3 text-secondary">아이디</div>
                            <div className="col-md-9 fw-semibold">{member.memberId}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-3 text-secondary">닉네임</div>
                            <div className="col-md-9">
                                {member.memberNickname}
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-3 text-secondary">이메일</div>
                            <div className="col-md-9">
                                {member.memberEmail}
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-3 text-secondary">등급</div>
                            <div className="col-md-9">
                                <span className={`badge ${
                                    member.memberLevel === "관리자"
                                        ? "bg-danger"
                                        : "bg-primary"
                                }`}>
                                    {member.memberLevel}
                                </span>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-3 text-secondary">포인트</div>
                            <div className="col-md-9">
                                {member.memberPoint} P
                            </div>
                        </div>

                        <div className="row mb-0">
                            <div className="col-md-3 text-secondary">가입일</div>
                            <div className="col-md-9">
                                {member.memberJoin}
                            </div>
                        </div>
                    </div>
                    <div className="col-2">
                            {/* <span className="btn btn-secondary mt-1 ms-1" disabled>수정</span> */}
                            <button className="btn btn-danger mt-1 ms-1"  onClick={(e) => deleteMember(member.memberId, e)}>탈퇴</button>
                    </div>
                </div>
            </div>
</div>
    );
}