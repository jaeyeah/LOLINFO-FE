import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom";



export default function TeamInsert(){

    //state
    const {tournamentId} = useParams();
    const [team, setTeam] = useState({
        tournamentId : tournamentId, teamName : "",
        teamTop : "", teamJug : "", teamMid : "", teamAd : "", teamSup : "",
        teamRanking : "", teamNote : ""
    });
    const [teamClass, setTeamClass] = useState({
        teamName : "", teamRanking : "", teamNote : "",
        teamTop : "", teamJug : "", teamMid : "", teamAd : "", teamSup : "",
    });

    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setStreamer(prev=>({...prev, [name]:value}))
    },[])

    // 이름
    const checkTeamName = useCallback(e=>{
         const valid = team.teamName.length > 0;
        setTeamClass(prev=>({...prev, teamName : valid ? "is-valid" : "is-invalid"}));
    },[team, teamClass])






    const teamValid = useMemo(()=>{
        //필수항목
        if(teamClass.teamName !== "is-valid") return false;
        if(teamClass.teamTop !== "is-valid") return false;
        if(teamClass.teamJug !== "is-valid") return false;
        if(teamClass.teamMid !== "is-valid") return false;
        if(teamClass.teamAd !== "is-valid") return false;
        if(teamClass.teamSup !== "is-valid") return false;
        return true;
    },[teamClass]);

    //최종 가입
    const sendData = useCallback(async()=>{
        if(teamValid === false) return ;
        try{
            const response = await axios.post("/team/",team);
            console.log("성공", response);
            navigate(`/tournament/${tournamentId}`); // 메인페이지
        }
        catch(err){
            console.log("팀 등록 실패");
            console.log("err.response.status", err.response?.status);
            console.log("err.response.data", err.response?.data);
        }
    },[team,teamValid])

return(<>

    <div className="insert-form">

    <div className="row">
        <div className="col text-center">
            <h2>신규 팀 등록</h2>
            <hr/>
        </div>
    </div>

    {/* 스트리머 목록 */}
        {/* 이름 */}
        <div className="row mt-2">
            <label className="col-sm-3 col-form-label">팀 이름</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${teamValid.teamName}`} 
                            name="teamName" value={team.teamName}
                            onChange={changeStrValue}
                            onBlur={checkTeamName}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>




        
        {/* 등록버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-insert w-100"
                            disabled={teamValid === false}
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