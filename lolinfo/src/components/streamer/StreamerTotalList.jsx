import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"
import "../tournament/Tournament.css";
import "./Streamer.css";
import "./Search.css";
import { FaHome, FaSearch } from "react-icons/fa";
import Pagination from "../Pagination";
import { adminState, loginState } from "../../utils/jotai";
import { useAtomValue } from "jotai";

export default function StreamerTotalList() {
    //검색어 state
    const [keyword, setKeyword] = useState("");
    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);
    const [streamerList, setStreamerList] = useState([]);
    // 페이지네이션 설정
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });
    //로딩중 설정
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadData = useCallback( async() => {
        try {
            setLoading(true);
            setError(null);
            const {data} = await axios.get("/streamer/totalList", {params : {page}});
            setStreamerList(data.list);
            setPageData(data.pageVO);
        } catch (error) {
            console.error("Error fetching streamer list:", error);
        }
        finally {
          setLoading(false);
        }
    }, [page]);

    useEffect(()=>{
        loadData();
    },[loadData]);
    
    //[입력창 제어 및 검색이동]
    const handleSearch = useCallback(async() => {
        if(keyword.trim().length === 0){
            alert("검색어를 입력해주세요.");
            return;
        }
        setPage(1);
        if (keyword.trim().length === 0) return;
        try {
            const {data} = await axios.get(`/streamer/keyword/${keyword}`, {params : {page}});
            setStreamerList(data.list);
            setPageData(data.pageVO);
        } catch (error) {
            console.error("Error fetching streamer list:", error);
        }
        setKeyword("");
    }, [keyword, page]);

    const renderTrophies = (count, type) => {
        const bigCount = Math.floor((count || 0) / 5);
        const smallCount = (count || 0) % 5;

        if (bigCount === 0 && smallCount === 0) {
            return (
                <div className="trophy-list trophy-empty">
                    <span className="record-none">기록 없음</span>
                </div>
            );
        }

        return (
            <div className={`trophy-list trophy-${type}`}>
                {Array.from({ length: bigCount }).map((_, index) => (
                    <span key={`big-${type}-${index}`} className="trophy trophy-big">🏆</span>
                ))}
                {Array.from({ length: smallCount }).map((_, index) => (
                    <span key={`small-${type}-${index}`} className="trophy trophy-small">🏆</span>
                ))}
            </div>
        );
    };

    //render
    return (<>
    <h2 className="section-title text-center">Soop : 전체 스트리머 목록</h2>
    <div className="row mt-3 justify-content-center">
        <div className="col-12 col-xl-8">
            <div className="streamer-control-panel">
                <div className="streamer-toggle-group">
                    <Link to="/streamer" className="streamer-btn btn btn-nonClick">공식</Link>
                    <Link to="/streamerTotal" className="streamer-btn btn btn-click">전체</Link>
                </div>
                <div className="search-wrapper flex-grow-1">
                    <div className="input-group streamer-search-group">
                        <input
                            type="text"
                            className="search form-control search-bar text-light"
                            value={keyword}
                            placeholder="스트리머 검색"
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                        />
                        <button className="search btn btn-success" onClick={handleSearch}>
                            <FaSearch className="fs-4" />
                        </button>
                    </div>
                </div>
                {isAdmin === true && (
                    <div className="streamer-admin-action">
                        <Link to="/streamer/insert" className="btn btn-success">등록</Link>
                    </div>
                )}
            </div>
        </div>
    </div>
    {/* 로딩중 or 에러 */}
    {loading && (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border" role="status" />
        </div>
    )}
    {error && <p className="text-danger">{error}</p>}

    {/* 스트리머 목록 */}
    <div className="row mt-3 justify-content-center">
        <div className="col-12 col-xl-8 streamer-list-wrapper">
            {streamerList.map((streamer)=>(
                <div key={streamer.streamerNo} className="card tournament-card mb-3 streamer-tournament-card">
                    <Link to={`/streamer/${streamer.streamerNo}`} className="streamer-card-link">
                        <div className="row g-0 tournament-row">
                            <div className="col-2 year-tag streamer-profile-box">
                                <img src={streamer.streamerProfile} className="streamer-profile" alt={streamer.streamerName} />
                            </div>
                            <div className="col-10 period-box">
                                <div className="period-box-header team-badge">
                                    <div className="col">
                                        <span className="text-light fs-5">{streamer.streamerName}</span>
                                        <span className="text-muted"> @{streamer.streamerSoopId}</span>
                                    </div>
                                </div>
                                <div className="period-box-body">
                                    <div className="col streamer-period-player">
                                        <div className="record-title record-champion">우승 : {streamer.totalRanking1} 회</div>
                                        {renderTrophies(streamer.totalRanking1, "champion")}
                                    </div>
                                    <div className="col streamer-period-player">
                                        <div className="record-title record-second">준우승 : {streamer.totalRanking2} 회</div>
                                        {renderTrophies(streamer.totalRanking2, "second")}
                                    </div>
                                    <div className="col streamer-period-player">
                                        <div className="record-title record-semi">4강 : {streamer.totalRanking3} 회</div>
                                        {renderTrophies(streamer.totalRanking3, "semi")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
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
    
    
    </>)

}