import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import "./Streamer.css";

export default function StreamerDetail() {

    const {streamerId} = useParams();
    const [streamer, setStreamer] = useState({});


    //render
    return (<>
    
    <div className="row">
        <div className="col-8">
            <h2>스트리머 상세</h2>
        </div>
    </div>
    
    
    </>)

}