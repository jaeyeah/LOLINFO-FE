import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"
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

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get("/streamer/totalList", {params : {page}});
            setStreamerList(data.list);
            setPageData(data.pageVO);
        } catch (error) {
            console.error("Error fetching streamer list:", error);
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
    //render
    return (<>
    {/* 검색영역 */}
    <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
            <div className="row align-items-center">
                <div className="col-10 col-md-10 d-flex align-items-center flex-nowrap">
                    <Link to="/streamer" className="ms-2 streamer-btn p-2 btn btn-nonClick">공식</Link>
                    <Link to="/streamerTotal" className="ms-2 streamer-btn p-2 btn btn-click">전체</Link>
                    <div className="ms-3 input-group search-wrapper">
                        {/* 검색창 */}
                        <input type="text" className="search form-control search-bar text-light" value={keyword}
                            placeholder="스트리머" onChange={e => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} />
                        {/* 검색 버튼 */}
                        <button className="search btn btn-success" onClick={handleSearch}>
                            <FaSearch className="fs-4" />
                        </button>
                    </div>
                </div>
                {isAdmin === true && (
                    <div className="col-2 text-end">
                        <Link to="/streamer/insert" className="btn btn-success">등록</Link>
                    </div>
                )}
            </div>
        </div>
    </div>


    {/* 스트리머 목록 */}
    <div className="row mt-2 justify-content-center">
        <div className="col-12 col-xl-8 streamer-wrapper">
            {streamerList.map((streamer)=>(
                <div key={streamer.streamerNo} className="card streamer-card mb-3">
                    <div className="row g-0">
                        <div className="col-2">
                            <Link to={`/streamer/${streamer.streamerNo}`} className="streamer-link d-flex w-100 h-100">
                                <img src={streamer.streamerProfile} className="streamer-profile img-fluid rounded-start" />
                            </Link>
                        </div>
                        <div className="col-10">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="card-title">{streamer.streamerName} </span>
                                    <span className="card-text">{streamer.streamerSoopId}</span>
                                </div>
                                <div className="text-end">
                                    <Link to={streamer.streamerStation} className="btn btn-station ms-3" target="_blank" rel="noopener noreferrer"><FaHome className="fs-4"/></Link>
                                    <Link to={`/streamer/${streamer.streamerNo}`} className="btn btn-secondary ms-2" target="_blank" rel="noopener noreferrer">상세</Link>
                                </div>
                            </div>
                            
                            
                            <div className="row card-body text-center stat-box">
                                <div className="col ">
                                    <span className="card-text text-white">우승 </span>
                                    <hr/>
                                    <span className={`badge stat-badge card-text ${streamer.totalRanking1 > 0 && 'streamer-stat1'}`}>
                                        {streamer.totalRanking1} 회
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card-text text-white">준우승 </span>
                                    <hr/>
                                    <span className={`badge stat-badge card-text ${streamer.totalRanking2 > 0 && 'streamer-stat2'}`}>
                                        {streamer.totalRanking2} 회
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card-text text-white">4강 </span>
                                    <hr/>
                                    <span className={`badge stat-badge card-text ${streamer.totalRanking3 > 0 && 'streamer-stat3'}`}>
                                        {streamer.totalRanking3} 회
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
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