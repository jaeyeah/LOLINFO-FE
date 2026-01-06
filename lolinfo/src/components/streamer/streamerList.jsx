import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"
import "./Streamer.css";
import { FaHome } from "react-icons/fa";

export default function StreamerList() {

    const [streamerList, setStreamerList] = useState([]);

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get("/streamer/");
            setStreamerList(data);
            console.log(data);
        } catch (error) {
            console.error("Error fetching streamer list:", error);
        }
    }, []);

    useEffect(()=>{
        loadData();
    },[]);

    //render
    return (<>
    
    <div className="row justify-content-center mt-2">
        <div className="col-12 col-lg-8">
            <div className="row align-items-center">
                <div className="col-12 col-md-10 d-flex align-items-center">
                    <span className="fs-2 page-title">스트리머 목록 : 공식대회 </span>
                    <Link to="/streamer" className="ms-2 btn btn-click">공식</Link>
                    <Link to="/streamerTotal" className="ms-2 btn btn-nonClick">전체</Link>
                </div>
                <div className="col-2 text-end">
                    <Link to="/streamer/insert" className="btn btn-success">등록</Link>
                </div>
            </div>
        </div>
    </div>

    {/* 스트리머 목록 */}
    <div className="row mt-2 justify-content-center">
        <div className="col-12 col-lg-8 streamer-wrapper">
            {streamerList.map((streamer)=>(
                <div key={streamer.streamerNo} className="card streamer-card mb-3">
                    <div className="row g-0">
                        <div className="col-md-2 col-2 d-flex">
                            <Link to={`/streamer/${streamer.streamerNo}`} className="streamer-link d-flex w-100 h-100">
                            <img src={streamer.streamerProfile} className="streamer-profile img-fluid rounded-start" />
                            </Link>
                        </div>
                        <div className="col-md-10 col-7">
                            <div className="card-body">
                                <span className="card-title">{streamer.streamerName} </span>
                                <span className="card-text">{streamer.streamerSoopId}</span>
                                <Link to={streamer.streamerStation} className="btn btn-station ms-3" target="_blank" rel="noopener noreferrer"><FaHome className="fs-4"/></Link>
                                <Link to={`/streamer/${streamer.streamerNo}`} className="btn btn-secondary ms-2" target="_blank" rel="noopener noreferrer">스트리머 상세</Link>
                            </div>
                            
                            <div className="row card-body text-center">
                                <div className="col">
                                    <span className="card-text text-white">우승 </span>
                                    <hr/>
                                    <span className={`badge stat-badge card-text ${streamer.officialRanking1 > 0 && 'streamer-stat1'}`}>
                                        {streamer.officialRanking1} 회
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card-text text-white">준우승 </span>
                                    <hr/>
                                    <span className={`badge stat-badge card-text ${streamer.officialRanking2 > 0 && 'streamer-stat2'}`}>
                                        {streamer.officialRanking2} 회
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card-text text-white">4강 </span>
                                    <hr/>
                                    <span className={`badge stat-badge card-text ${streamer.officialRanking3 > 0 && 'streamer-stat3'}`}>
                                        {streamer.officialRanking3} 회
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    </div>
    
    
    </>)

}