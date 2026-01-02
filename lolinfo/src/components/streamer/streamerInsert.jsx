import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import "./Streamer.css";

export default function StreamerList() {

    const navigate = useNavigate();

    const [streamer, setStreamer] = useState({
        streamerName: "",
        streamerSoopId: ""
    });
    const [streamerClass, setStreamerClass] = useState({
        streamerName: "",
        streamerSoopId: ""
    });

    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setStreamer(prev=>({...prev, [name]:value}))
    },[])

    // 이름
    const checkStreamerName = useCallback(e=>{
         const valid = streamer.streamerName.length > 0;
        setStreamerClass(prev=>({...prev, streamerName : valid ? "is-valid" : "is-invalid"}));
    },[streamer, streamerClass])
    const checkStreamerSoopId = useCallback(e=>{
         const valid = streamer.streamerSoopId.length > 0 || streamer.streamerSoopId.length === 0;
        setStreamerClass(prev=>({...prev, streamerSoopId : valid ? "is-valid" : "is-invalid"}));
    },[streamer, streamerClass])

    //memo
    // 모든 항목이 유효한지 검사(선택항목은 is-invalid가 아니어야함)
    const streamerValid = useMemo(()=>{
        //필수항목
        if(streamerClass.streamerName !== "is-valid") return false;
        if(streamerClass.streamerSoopId !== "is-valid") return false;
        return true;
    },[streamerClass])

    //callback
    //최종 가입
    const sendData = useCallback(async()=>{
        if(streamerValid === false) return ;
        try{
            const response = await axios.post("/streamer/",streamer);
            console.log("성공", response);
            navigate("/streamer"); // 메인페이지
        }
        catch(err){
            console.log("스트리머 등록 실패");
            console.log("err.response.status", err.response?.status);
            console.log("err.response.data", err.response?.data);
        }
    },[streamer,streamerValid])



    //render
    return (<>
    
    <div className="insert-form">

    <div className="row">
        <div className="col text-center">
            <h2>신규 스트리머 등록</h2>
            <hr/>
        </div>
    </div>

    {/* 스트리머 목록 */}
        {/* 이름 */}
        <div className="row mt-2">
            <label className="col-sm-3 col-form-label">이름</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${streamerClass.streamerName}`} 
                            name="streamerName" value={streamer.streamerName}
                            onChange={changeStrValue}
                            onBlur={checkStreamerName}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">SoopID</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${streamerClass.streamerSoopId}`} 
                            name="streamerSoopId" value={streamer.streamerSoopId}
                            onChange={changeStrValue}
                            onBlur={checkStreamerSoopId}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        
        {/* 등록버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-insert w-100"
                            disabled={streamerValid === false}
                            onClick = {sendData}
                            >
                {/* <FaUser className="me-2"/> */}
                <span>등록</span>
                </button>
            </div>
        </div>
    
    </div>
    </>)

}