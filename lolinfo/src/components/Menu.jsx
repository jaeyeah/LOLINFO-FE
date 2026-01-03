import { Link, useNavigate } from "react-router-dom"
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import './Menu.css'

import { IoMdPerson } from "react-icons/io";
import { SiLeagueoflegends } from "react-icons/si";


export default function Menu() {
    const navigate = useNavigate();

    //통합 state




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


    return (<>

        <nav className="navbar navbar-expand-lg  text-light cinema-navbar fixed-top" data-be-theme="dark"
            ref={menuRef}>
            <div className="container-fluid">

                {/* 브랜딩 텍스트(이미지) : 메뉴 가장 좌측에 나오는 로고 또는 텍스트 */}
                <Link className="navbar-brand cinema-brand text-light" to="/" onClick={closeMenu}>
                    <img src="https://res.sooplive.co.kr/images/svg/soop_logo.svg"
                        width="40" height="40"/>
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
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        {/* 우측 메뉴 */}
                        <li className   ="nav-item">
                            <Link className="nav-link" to={``} onClick={closeMenu}>
                                <span>MY</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </>)
}