import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"
import "./Streamer.css";

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
    
    <div className="row">
        <div className="col-8">
            <h2>스트리머 목록</h2>
        </div>
        <div className="col-4 text-end">
            <Link to="/streamer/insert" className="btn btn-success">등록</Link>
        </div>
    </div>


    {/* 스트리머 목록 */}
    <div className="row mt-2">
        <div className="col-12 streamer-wrapper">
            {streamerList.map((streamer)=>(
                <div key={streamer.streamerNo} className="card streamer-card mb-3">
                    <div className="row g-0">
                        <div className="col-md-2 col-2 d-flex">
                            <img src={streamer.streamerProfile} className="streamer-profile img-fluid rounded-start"/>
                        </div>
                        <div className="col-md-7 col-7">
                            <div className="card-body">
                                <span className="card-title">{streamer.streamerName} </span>
                                <span className="card-text">{streamer.streamerSoopId}</span>
                            </div>
                            <div className="row card-body text-center">
                                <div className="col">
                                    <span className="card-text text-white">우승 </span>
                                    <hr/>
                                    <span className="card-text">
                                        {/* {streamer.streamerSoopId} */} 00회
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card-text text-white">준우승 </span>
                                    <hr/>
                                    <span className="card-text">
                                        {/* {streamer.streamerSoopId} */} 00회
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card-text text-white">4강 </span>
                                    <hr/>
                                    <span className="card-text">
                                        {/* {streamer.streamerSoopId} */} 00회
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-3 d-flex">
                            <div className="card-body d-flex align-items-center justify-content-end">
                                <Link to={streamer.streamerStation} className="btn btn-secondary ms-3" target="_blank" rel="noopener noreferrer">Link</Link> 
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    
    
    </>)

}