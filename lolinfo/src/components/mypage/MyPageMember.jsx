import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAtomValue } from 'jotai';
import { loginIdState } from '../../utils/jotai';

export default function AdminMemberPage() {

    const loginId = useAtomValue(loginIdState);

    // 상태 관리
    const [member, setMember] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. 회원 목록 불러오기
    const loadData = async () => {
        if (!loginId) return;

        setLoading(true);
        try {
            const res = await axios.get(`/mypage/`);
            setMember(res.data);
            console.log(res.data);
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
                                <span className="btn btn-secondary mt-1 ms-1 ">수정</span>
                                <span className="btn btn-danger mt-1 ms-1">탈퇴</span>

                    </div>
                </div>
            </div>
</div>
    );
}