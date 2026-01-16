import { Link, useNavigate } from "react-router-dom"
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import './Menu.css'

import { IoMdPerson } from "react-icons/io";
import { SiLeagueoflegends } from "react-icons/si";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../utils/jotai";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { FaGear } from "react-icons/fa6";

export default function Menu() {
    const navigate = useNavigate();

    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [loginComplete, setLoginComplete] = useAtom(loginCompleteState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);
    const clearLogin = useSetAtom(clearLoginState);



    //메뉴가 정상적으로 닫히지 않는 현상에 대한 해결 (좁은 폭인 경우)
    const [open, setOpen] = useState(false);
    const toggleMenu = useCallback(() => { setOpen(prev => !prev); }, []);

    //메뉴 및 외부 영역 클릭 시 메뉴가 닫히도록 처리하는 코드
    const closeMenu = useCallback(() => {
        setOpen(false);
    }, []);
    const menuRef = useRef();
    useEffect(() => {
        //클릭 감지 함수
        const listener = e => {
            if (open === true && menuRef.current.contains(e.target) === false) {
                closeMenu();
            }
        };
        window.addEventListener("mousedown", listener);
        return () => {//clean up 함수
            window.removeEventListener("mousedown", listener);
        };
    }, [open]);

    //로그아웃
    const logout = useCallback(async (e) => {
        e.stopPropagation();
        e.preventDefault();
        clearLogin();
        await axios.delete("/member/logout");
        delete axios.defaults.headers.common['Authorization'];
        navigate("/");

        closeMenu();
    }, []);


    return (<>

        <nav className="navbar navbar-expand-lg  text-light cinema-navbar fixed-top" data-be-theme="dark"
            ref={menuRef}>
            <div className="container-fluid">

                {/* 브랜딩 텍스트(이미지) : 메뉴 가장 좌측에 나오는 로고 또는 텍스트 */}
                <Link className="navbar-brand cinema-brand text-light fs-4" to="/" onClick={closeMenu}>
                        <div className="sooplol-icon-focus">
                            <div className="infinity"></div>
                            <span className="l-letter text-dark">L</span>
                        </div>
                </Link>

                {/* 토글버튼 */}
                <button className="navbar-toggler " type="button"
                    aria-controls="menu-body" aria-expanded="false" aria-label="Toggle navigation"
                    onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${open && 'show'}`} id="menu-body">
                    {/* 좌측 메뉴 */}
                    <ul className="navbar-nav me-auto">
                        {/* contents */}
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link" to="/streamer">
                                <IoMdPerson className="fs-4"/>
                            </Link>
                        </li>
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link" to="/tournament">
                                <SiLeagueoflegends className="fs-4"/>
                            </Link>
                        </li>
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link fw-600" to="/streamer/654">
                                멸망전
                            </Link>
                        </li>
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link fw-600" to="/streamer/655">
                                SLL
                            </Link>
                        </li>
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link fw-600" target="_blank" to="https://www.sooplive.co.kr/">
                                <img src="https://res.sooplive.co.kr/images/svg/soop_logo.svg" width="50" height="23"/>
                            </Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        {/* 우측 메뉴 */}

                        {isLogin === true ? (<>  {/* 로그인 시 나와야 하는 화면 */}
                            {isAdmin === true ? (
                                <>
                                <li className="nav-item" onClick={closeMenu}>
                                    <Link className="nav-link" to={`/admin`}>
                                        <span><FaGear /></span>
                                    </Link>
                                </li>
                                </>
                            ) : (
                                <>

                                </>
                            )}
                            {/* <li className="nav-item">
                                <Link className="nav-link" to={`/member/mypage/myinfo/${loginId}`} onClick={closeMenu}>
                                    <span>MY</span>
                                </Link>
                            </li> */}
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" onClick={logout}>
                                    <span>로그아웃</span>
                                </Link>
                            </li>
                        </>) : (<>  {/* 비로그인 시 나와야 하는 화면 */}
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" to="/member/login">
                                    <span>로그인</span>
                                </Link>
                            </li>
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" to="/member/join">
                                    <span>회원가입</span>
                                </Link>
                            </li>
                        </>)}

                    </ul>
                </div>
            </div>
        </nav>
    </>)
}