import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
// import '../AdminMain.css'; // 사이드바 스타일
import { FaBars, FaXmark } from 'react-icons/fa6';

export default function MyPageMain() {

    // 사이드바 열림/닫힘 상태 관리 (모바일용)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 토글 함수
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="d-flex admin-layout-container" style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
            
            {/* 🌑 모바일용 오버레이 (사이드바 열렸을 때 배경 클릭하면 닫힘) */}
            {isSidebarOpen && (
                <div className="admin-sidebar-overlay d-md-none" onClick={closeSidebar}></div>
            )}

            {/* [왼쪽] 사이드바 */}
            {/* open 클래스가 붙으면 모바일에서 튀어나옴 */}
            <div className={`admin-sidebar p-3 text-white ${isSidebarOpen ? 'open' : ''}`}>
                
                {/* 사이드바 헤더 (PC: 제목 / 모바일: 제목 + 닫기버튼) */}
                <div className="d-flex justify-content-between align-items-center mb-4 ps-2 mt-2">
                    <h4 className="fw-bold m-0">👥 마이페이지</h4>
                    {/* 모바일 전용 닫기(X) 버튼 */}
                    <button className="btn text-white d-md-none" onClick={closeSidebar}>
                        <FaXmark size={24} />
                    </button>
                </div>
                
                <div className="list-group list-group-flush">
                    {/* 메뉴 클릭 시 모바일에서는 사이드바가 닫혀야 편함 -> onClick={closeSidebar} */}
                    
                    <NavLink to="member" className="list-group-item admin-menu-item" onClick={closeSidebar}>
                        회원 정보
                    </NavLink>

                    <NavLink to="scrim" className="list-group-item admin-menu-item" onClick={closeSidebar}>
                        등록한 스크림
                    </NavLink>

                    <NavLink to="ck" className="list-group-item admin-menu-item" onClick={closeSidebar}>
                        등록한 CK
                    </NavLink>

                    <NavLink to="bookmark" className="list-group-item admin-menu-item" onClick={closeSidebar}>
                        즐겨찾기
                    </NavLink>
                </div>
            </div>

            {/* [오른쪽] 컨텐츠 영역 */}
            <div className="flex-grow-1 p-4 admin-content-dark">
                
                {/* 🍔 모바일 전용 햄버거 메뉴 버튼 */}
                <button 
                    className="btn btn-dark border-secondary d-md-none mb-3" 
                    onClick={toggleSidebar}
                >
                    <FaBars size={20} className="me-2"/> 메뉴 열기
                </button>

                <div className="container-fluid admin-inner-box p-4 rounded">
                    <Outlet />
                </div>
            </div>

        </div>
    );
}