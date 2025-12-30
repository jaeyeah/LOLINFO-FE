import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"
import "./streamer.css";

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
        <div className="col-12">
            {streamerList.map((streamer)=>(
                <div key={streamer.streamerNo} className="card mb-3">
                    <div className="row g-0">
                        <div className="col-md-4">
                            <img src={streamer.streamerProfile} className="streamer-profile img-fluid rounded-start" alt={streamer.name} />
                        </div>
                        <div className="col-md-8">
                            <div className="card-body">
                                <span className="card-title">{streamer.streamerName}</span>
                                <span className="card-text">{streamer.streamerSoopId}</span>
                                <Link to={streamer.streamerStation} className="btn btn-primary ms-3" target="_blank" rel="noopener noreferrer">방송국</Link> 
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    
    
    </>)

}