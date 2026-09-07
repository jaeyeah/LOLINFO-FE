import { Link, useLocation } from "react-router-dom"
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import './Menu.css'

import { IoMdPerson } from "react-icons/io";
import { SiLeagueoflegends } from "react-icons/si";
import { adminState, clearLoginState, loginState } from "../utils/jotai";
import { useAtomValue, useSetAtom } from "jotai";
import { FaGear } from "react-icons/fa6";

export default function Menu() {
    // 로그인 시 이전 장소 기억
    const location = useLocation();
    //통합 state
    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);
    const clearLogin = useSetAtom(clearLoginState);



    //메뉴가 정상적으로 닫히지 않는 현상에 대한 해결 (좁은 폭인 경우)
    const [open, setOpen] = useState(false);
    const [homeOpen, setHomeOpen] = useState(false);
    const [tournamentOpen, setTournamentOpen] = useState(false);
    const toggleMenu = useCallback(() => { setOpen(prev => !prev); }, []);

    //메뉴 및 외부 영역 클릭 시 메뉴가 닫히도록 처리하는 코드
    const closeMenu = useCallback(() => {
        setOpen(false);
        setHomeOpen(false);
        setTournamentOpen(false);
    }, []);
    const menuRef = useRef();
    useEffect(() => {
        //클릭 감지 함수
        const listener = e => {
            if (menuRef.current && menuRef.current.contains(e.target) === false) {
                closeMenu();
            }
        };
        window.addEventListener("mousedown", listener);
        return () => {//clean up 함수
            window.removeEventListener("mousedown", listener);
        };
    }, [closeMenu]);


    //로그아웃
    const logout = useCallback(async (e) => {
        e.stopPropagation();
        e.preventDefault();
        clearLogin();
        await axios.delete("/member/logout");
        delete axios.defaults.headers.common['Authorization'];
        // navigate("/");

        closeMenu();
    }, [clearLogin, closeMenu]);


    return (<>

        <nav className="navbar navbar-expand-lg text-light cinema-navbar fixed-top" data-be-theme="dark"
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
                    aria-controls="menu-body" aria-expanded={open} aria-label="Toggle navigation"
                    onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="menu-body">
                    {/* 좌측 메뉴 */}
                    <ul className="navbar-nav me-auto">
                        {/* contents */}
                        <li className={`nav-item dropdown ${homeOpen ? 'show' : ''}`}>
                            <div className="dropdown-nav">
                                <Link
                                    className="nav-link dropdown-parent-link"
                                    to="/"
                                    onClick={closeMenu}
                                >
                                    홈
                                </Link>
                                <button
                                    className="dropdown-toggle dropdown-trigger"
                                    type="button"
                                    aria-label="홈 하위 메뉴 열기"
                                    aria-haspopup="true"
                                    aria-expanded={homeOpen}
                                    onClick={() => {
                                        if (window.innerWidth < 992) {
                                            setHomeOpen(prev => !prev);
                                            setTournamentOpen(false);
                                        }
                                    }}
                                />
                            </div>

                            <ul className={`dropdown-menu dropdown-menu-dark ${homeOpen ? 'show' : ''}`}>
                                <li>
                                    <Link className="dropdown-item" to="/" onClick={closeMenu}>
                                        홈
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/about" onClick={closeMenu}>
                                        서비스 소개
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/data-criteria" onClick={closeMenu}>
                                        데이터 집계 기준
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/devhistory" onClick={closeMenu}>
                                        패치노트
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link" to="/streamer">
                                <IoMdPerson className="fs-4"/> 스트리머
                            </Link>
                        </li>
                        <li className={`nav-item dropdown ${tournamentOpen ? 'show' : ''}`}>
                            <div className="dropdown-nav">
                                <Link
                                    className="nav-link dropdown-parent-link"
                                    to="/tournament"
                                    onClick={closeMenu}
                                >
                                    <SiLeagueoflegends className="fs-4" /> 대회
                                </Link>
                                <button
                                    className="dropdown-toggle dropdown-trigger"
                                    type="button"
                                    aria-label="대회 하위 메뉴 열기"
                                    aria-haspopup="true"
                                    aria-expanded={tournamentOpen}
                                    onClick={() => {
                                        if (window.innerWidth < 992) {
                                            setTournamentOpen(prev => !prev);
                                            setHomeOpen(false);
                                        }
                                    }}
                                />
                            </div>

                            <ul className={`dropdown-menu dropdown-menu-dark ${tournamentOpen ? 'show' : ''}`}>
                                <li>
                                    <Link className="dropdown-item" to="/tournament" onClick={closeMenu}>
                                        대회
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/streamer/654" onClick={closeMenu}>
                                        멸망전
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/streamer/655" onClick={closeMenu}>
                                        SLL
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item" onClick={closeMenu}>
                            <Link className="nav-link fw-600" to="/ck">
                                CK
                            </Link>
                        </li>
                        {isLogin === true ? (<>  {/* 로그인 시 나와야 하는 화면 */}
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" to="/board">
                                    <span>게시판</span>
                                </Link>
                            </li>
                            </>
                        ) : (<> </> )} {/* 비로그인 시 나와야 하는 화면 */}
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
                            <li className="nav-item">
                                <Link className="nav-link" to="/mypage" onClick={closeMenu}>
                                    <span>MY</span>
                                </Link>
                            </li>
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" onClick={logout}>
                                    <span>로그아웃</span>
                                </Link>
                            </li>
                        </>) : (<>  {/* 비로그인 시 나와야 하는 화면 */}
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" to="/member/login" state={{from:location.pathname + location.search}}>
                                    <span>로그인</span>
                                </Link>
                            </li>
                            {/* <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" to="/member/join">
                                    <span>회원가입</span>
                                </Link>
                            </li> */}
                        </>)}

                    </ul>
                </div>
            </div>
        </nav>
    </>)
}