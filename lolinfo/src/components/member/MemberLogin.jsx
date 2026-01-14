import axios from "axios";
import { useCallback } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useAtom} from "jotai";
import { accessTokenState, loginIdState, loginLevelState, loginNicknameState, refreshTokenState } from "../../utils/jotai";
import "./Member.css";
import { FaUserPlus } from "react-icons/fa";
import { cleanExpiredViews } from '../../utils/localStorage/cleanStorage';



export default function MemberLogin(){
    //통합 state
    const [loginId , setLoginId] = useAtom(loginIdState);
    const [loginLevel , setLoginLevel] = useAtom(loginLevelState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    const [accessToken , setAccessToken] = useAtom(accessTokenState);
    const [refreshToken , setRefreshToken] = useAtom(refreshTokenState);
    // 도구
    const navigate = useNavigate();
    //state
    const [loginResult, setLoginResult] = useState(null);

    const [member, setMember] = useState({
        memberId : "", memberPw : ""
    })

    //callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev =>({...prev, [name] : value}));
    },[])

    const [login, setLogin] = useState(null); // null 시도x -> true or false
    const sendLogin = useCallback(async()=>{
        try{
            //로그인 시도
            const {data} = await axios.post("/member/login", member);

            // Authorization에 accesstoken 저장
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
            console.log(data);
            //통합 state 저장
            setLoginId(data.loginId);
            setLoginLevel(data.loginLevel);
            setLoginNickname(data.loginNickname);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            // state저장
            setLogin(true);
            setLoginResult(true)
            console.log("로그인 성공");
            // 로컬 스토리지 불필요한 key 제거
            cleanExpiredViews();
            // 화면이동
            navigate("/");
        }
        catch(err){
            setLogin(false);
            setLoginResult(false);
            console.log("로그인 실패");
        }
    },[member])


    //render
    return(<>
    <div className="container">
        <div className="row d-flex justify-content-center">
        <div className="login-form col-12">
        <div className="row">
            <div className="col">
                <h1 className="text-center">로그인</h1>
            </div>
        </div>

        <div className="row mt-5 d-flex justify-content-center text-nowrap">
            <div className="col-12 input-group login-wrapper">
                <span className="input-group-text login-label text-light text-center fs-5">아이디</span>
                <input type="text" className="form-control login login-bar text-light ms-3 fs-5" 
                    name="memberId" value={member.memberId}
                    onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-3 d-flex justify-content-center text-nowrap">
            <div className="col-12 input-group login-wrapper">
                <span className="input-group-text login-label text-light text-center fs-5">비밀번호</span>
                <input type="password" className="form-control login login-bar text-light fs-5" 
                    name="memberPw" value={member.memberPw}
                    onChange={changeStrValue}/>
            </div>
        </div>



        <div className="row mt-3 d-flex justify-content-center text-nowrap">
            
            <div className="col-12 text-center">
                {loginResult === false && (
                    <div className="row">
                        <div className="col fs-6 text-center text-danger">
                            아이디 또는 비밀번호가 잘못되었습니다
                        </div>s
                    </div>
                )}
                <button type="button" className="mt-2 login btn fs-4"
                        onClick={sendLogin}> 로그인
                </button>
            </div>
        </div>

        <div className="row mt-3">
            <div className="col">
                <hr className="login-hr"/>
            </div>
        </div>

        <div className="row mt-3 text-center d-flex justify-content-center">
            <div className="col text-nowrap">
                <Link className="text-decoration-none fs-5 login-link" to="/member/join">
                    <FaUserPlus className="mb-1 me-2" /> 회원가입
                </Link>
            </div>
            {/* <div className="col text-nowrap">
                <Link className="text-decoration-none fs-5 login-link" to="#">아이디/비밀번호 찾기</Link>
            </div> */}
        </div>
</div>
</div>
</div>
    </>)
}