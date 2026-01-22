import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { useAtomValue } from "jotai";
import { loginState } from "../../utils/jotai";


export default function TeamInsert(){

    const navigate = useNavigate();
    const isLogin = useAtomValue(loginState);
    //state
    const {tournamentId} = useParams();
    const [checking, setChecking] = useState(false);
    //전송용 State
    const [team, setTeam] = useState({
        tournamentId : tournamentId, teamName : "",
        teamTop : "", teamJug : "", teamMid : "", teamAd : "", teamSup : "",
        teamRanking : "", teamNote : ""
    });
    // 입력용 + 화면용 State
    const [teamData, setTeamData] = useState({
        teamTop : "", teamJug : "", teamMid : "", teamAd : "", teamSup : "",
        topId : "", jugId: "", midId : "", adId : "", supId : ""
    });
    const [staffList, setStaffList] = useState([
        {staffStreamer : "", staffRole : "" , staffName : "", staffSoopId : ""}
    ]);
    // 피드백/Valid용 State
    const [teamClass, setTeamClass] = useState({
        teamName : "", teamRanking : "", teamNote : "",
        teamTop : "", teamJug : "", teamMid : "", teamAd : "", teamSup : "",
    });

    // callback -----------------------------------------------
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setTeam(prev=>({...prev, [name]:value}))
    },[])
    const changeTeamNameValue = useCallback(e=>{
        const {name, value} = e.target;
        setTeamData(prev=>({...prev, [name]:value}))
    },[])
    const changeStaffValue = useCallback((index,e)=>{
        const {name, value} = e.target;
        setStaffList(prev =>
        prev.map((staff, i) => (i === index ? { ...staff, [name]: value } : staff))
        );
    },[])
    // 개최자 칸 추가/삭제
    const addStaffRow = useCallback(() => {
      setStaffList(prev => [...prev, { staffStreamer: "", staffName: "" , staffRole : ""}]);
    }, []);
    const removeStaffRow = useCallback((index) => {
      setStaffList(prev => prev.filter((_, i) => i !== index));
    }, []);

    // 이름
    const checkTeamName = useCallback(e=>{
        const valid = team.teamName.length > 0;
        setTeamClass(prev=>({...prev, teamName : valid ? "is-valid" : "is-invalid"}));
    },[team, teamClass])



    // ==== 라인별 입력/중복검색 ====  ====  ====  ====  ==== 
        // top
        const checkTeamTop = useCallback(async(e)=>{
            try{
                setChecking(true); // 검증 시작
                const {data} = await axios.get(`/team/check/${teamData.teamTop}`);
                console.log("전송된 데이터", data);
                
                const valid = data.check == true;
                setTeamClass(prev=>({...prev, teamTop : valid ? "is-valid" : "is-invalid"}));
                setTeam(prev=>({...prev, teamTop : data.streamerNo}));
                setTeamData(prev=>({...prev, topId : data.streamerSoopId}));
            }
            catch(err){
                console.log("err",err);
                setTeamClass(prev => ({ ...prev, teamTop: "is-invalid" }));
            }
            finally {
             setChecking(false); // 검증 끝
            }
        },[team, teamClass, teamData])
        // jug
        const checkTeamJug = useCallback(async(e)=>{
            try{
                setChecking(true); // 검증 시작
                const {data} = await axios.get(`/team/check/${teamData.teamJug}`);
                console.log("전송된 데이터", data);
                
                const valid = data.check == true;
                setTeamClass(prev=>({...prev, teamJug : valid ? "is-valid" : "is-invalid"}));
                setTeam(prev=>({...prev, teamJug : data.streamerNo}));
                setTeamData(prev=>({...prev, jugId : data.streamerSoopId}));
            }
            catch(err){
                console.log("err",err);
                setTeamClass(prev => ({ ...prev, teamJug: "is-invalid" }));
            }
            finally {
             setChecking(false); // 검증 끝
            }
        },[team, teamClass, teamData])
        // mid
        const checkTeamMid = useCallback(async(e)=>{
            try{
                setChecking(true); // 검증 시작
                const {data} = await axios.get(`/team/check/${teamData.teamMid}`);
                console.log("전송된 데이터", data);
                
                const valid = data.check == true;
                setTeamClass(prev=>({...prev, teamMid : valid ? "is-valid" : "is-invalid"}));
                setTeam(prev=>({...prev, teamMid : data.streamerNo}));
                setTeamData(prev=>({...prev, midId : data.streamerSoopId}));
            }
            catch(err){
                console.log("err",err);
                setTeamClass(prev => ({ ...prev, teamMid: "is-invalid" }));
            }
            finally {
             setChecking(false); // 검증 끝
            }
        },[team, teamClass, teamData])
        // ad
        const checkTeamAd = useCallback(async(e)=>{
            try{
                setChecking(true); // 검증 시작
                const {data} = await axios.get(`/team/check/${teamData.teamAd}`);
                console.log("전송된 데이터", data);
                
                const valid = data.check == true;
                setTeamClass(prev=>({...prev, teamAd : valid ? "is-valid" : "is-invalid"}));
                setTeam(prev=>({...prev, teamAd : data.streamerNo}));
                setTeamData(prev=>({...prev, adId : data.streamerSoopId}));
            }
            catch(err){
                console.log("err",err);
                setTeamClass(prev => ({ ...prev, teamAd: "is-invalid" }));
            }
            finally {
             setChecking(false); // 검증 끝
            }
        },[team, teamClass, teamData])
        // sup
        const checkTeamSup = useCallback(async(e)=>{
            try{
                setChecking(true); // 검증 시작
                const {data} = await axios.get(`/team/check/${teamData.teamSup}`);
                console.log("전송된 데이터", data);
                
                const valid = data.check == true;
                setTeamClass(prev=>({...prev, teamSup : valid ? "is-valid" : "is-invalid"}));
                setTeam(prev=>({...prev, teamSup : data.streamerNo}));
                setTeamData(prev=>({...prev, supId : data.streamerSoopId}));
            }
            catch(err){
                console.log("err",err);
                setTeamClass(prev => ({ ...prev, teamSup: "is-invalid" }));
            }
            finally {
             setChecking(false); // 검증 끝
            }
        },[team, teamClass, teamData])

    const checkTeamRanking = useCallback(e=>{
        const valid = team.teamRanking.length > 0;
        setTeamClass(prev=>({...prev, teamRanking : valid ? "is-valid" : "is-invalid"}));
    },[team, teamClass])
    
    // 감독/코치 검사
    const checkStaff = useCallback(async(idx)=>{
        const name = staffList[idx]?.staffName;
        if(!name) return;
        try{
        const {data} = await axios.get(`/team/check/${name}`);
        console.log("전송된 데이터", data);

        setStaffList(prev => prev.map((h, i) =>
            i === idx ? { ...h, staffStreamer: data.streamerNo, staffSoopId: data.streamerSoopId } : h
        )
        );}
        catch(err){
           console.log("err",err);
        }
    },[staffList])

    // memo --------------------------------------------------
    const teamValid = useMemo(()=>{
        //필수항목
        if(teamClass.teamName !== "is-valid") return false;
        if(teamClass.teamTop === "is-invalid") return false;
        if(teamClass.teamJug === "is-invalid") return false;
        if(teamClass.teamMid === "is-invalid") return false;
        if(teamClass.teamAd === "is-invalid") return false;
        if(teamClass.teamSup === "is-invalid") return false;
        if(teamClass.teamRanking === "is-invalid") return false;
        return true;
    },[teamClass]);

    //최종 가입--------------------------------------------------
    const sendData = useCallback(async()=>{
        if(checking) return; 
        if(teamValid === false) return ;
        try{
            const payload = {
              teamDto : team,
              staffDto : staffList.map(s=>({staffStreamer : s.staffStreamer, staffRole : s.staffRole}))
            }
            const response = await axios.post("/team/",payload);
            console.log("성공", response);
            navigate(`/tournament/${tournamentId}`); // 메인페이지
        }
        catch(err){
            console.log("팀 등록 실패");
            console.log("err.response.status", err.response?.status);
            console.log("err.response.data", err.response?.data);
        }
    },[team,teamValid,staffList])

//render--------------------------------------------------
return(<>
<div className="insert-form d-f">

    <div className="row">
        <div className="col text-center">
            <h2>신규 팀 등록</h2>
            <hr/>
        </div>
    </div>

    {/* 팀 Input 목록 */}
        {/* 이름 */}
        <div className="row mt-2">
            <label className="col-sm-3 col-form-label">팀 이름</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${teamClass.teamName}`} 
                            name="teamName" value={team.teamName}
                            onChange={changeStrValue}
                            onBlur={checkTeamName}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        {/* 성적 */}
        <div className="row mt-2">
            <label className="col-sm-3 col-form-label">성적</label>
            <div className="col-sm-9">
                <select className={`form-control ${teamClass.teamRanking}`}  name="teamRanking" onChange={changeStrValue} onBlur={checkTeamRanking}>
                    <option value=""> - 선택 - </option>
                    <option value="우승">우승</option>
                    <option value="준우승">준우승</option>
                    <option value="4강">4강</option>
                    <option value="본선진출">본선진출</option>
                    <option value="예선탈락">예선탈락</option>
                    <option value="참가">참가</option>
                </select>
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        {/* 기타 메모 */}
        <div className="row mt-2">
            <label className="col-sm-3 col-form-label">메모</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${teamClass.teamNote}`} 
                            name="teamNote" value={team.teamNote}
                            onChange={changeStrValue}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
    {/* 라인별 입력 */}
    <div className="d-flex mt-2">
        {/* TOP */}
        <div className="row mt-2 d-block">
            <label className="col col-form-label d-flex justify-content-center">
                <img className="line-image ms-2"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALUAAAC1CAMAAAAujU6bAAAAWlBMVEX///9iTCfIqm7Vv5HYwphxXj2RgmiGdVnMsXqAb1GilYB5ZUb28uj6+PPRuIfQt4S0qZj59u/18Oa4r5/i0rLaxp/b1s6ajXaekHqXiHGLe2HLxLisoI7Lr3cSjjjOAAACAElEQVR4nO3c607DMAxA4ZXB2MZl3DYYl/d/TX4CXTFNbMeOOOcB2k9WWrVSlMWCiIiIiIiI6H/0tAxtf1OlPj+LbH1dN+tQ9fq+Dh2q3tWiI9X16EC1Ah2n1qDD1Cp0lHpX956OVSvRMepbJTpErUZHqPXoALUBur3aAt1cbYJurRbQh7RqAb29zKqW0MMmqVpAPw9Z1QL6OGRVy5NOqhbQL0NWtfCVdxyyqgX0asiqFtCvQ1b1HLSRel1wleq+0B2pL4cO1d/R3ah/oHtR/0R3oh6h+1CP0V2oN2N0D+pTdAfqk+XRg/p5Ap1fPTVq1D6hRi2HGrUcatRyqFHLxajfVjN6z6beTt113BVq1KhRo0aNGjVq1KhRo0aNGjVq1KhRo0aNGjVqrfruYkarbGptqFHLoUYthxq1nKN66YZ2VGsPcJByU3ui3dSuaC+1L9pJrTv+5e9c1NWHR83NQ+2O9lD7ox3UDdD26tpT3IqyVjdBW6vXD27S79mqP9qgbdWt0KbqRstjYaoWHsTHOfutC7owUwvou6mbmFejDkfXqOPRFeoE6HJ1BnSxOgW6VJ0DXahOgi5TZ0EXqfe//wS0RRepf68x2kb92Bhtom49aRN180lbqAPQenUEWq0OQWvVMWilOgitU0ehVerD1Zy9Hx4dNbMmIiIiIiIi6qhPfE9aaQteWwMAAAAASUVORK5CYII="/>
                <img className="player-profile ms-3"src={buildProfileUrl(teamData.topId)} alt={teamData.teamTop}/>
            </label>
            <div className="col">
                <input type="text" className={`form-control ${teamClass.teamTop}`} 
                            name="teamTop" value={teamData.teamTop}
                            onChange={changeTeamNameValue}
                            onBlur={checkTeamTop}  
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">탑 스트리머 불일치</div>
            </div>
        </div>
        {/* JUG */}
        <div className="row mt-2 ms-1 d-block">
            <label className="col col-form-label d-flex justify-content-center">
                <img className="line-image ms-2"src="data:image/png;base64,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"/>
                <img className="player-profile ms-3"src={buildProfileUrl(teamData.jugId)} alt={teamData.teamJug}/>
            </label>
            <div className="col">
                <input type="text" className={`form-control ${teamClass.teamJug}`} 
                            name="teamJug" value={teamData.teamJug}
                            onChange={changeTeamNameValue}
                            onBlur={checkTeamJug}  
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">정글 스트리머 불일치</div>
            </div>
        </div>
        {/* MID */}
        <div className="row mt-2 ms-1 d-block">
            <label className="col col-form-label d-flex justify-content-center">
                <img className="line-image ms-2"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALUAAAC1CAMAAAAujU6bAAAAY1BMVEX////Iqm1hSiNrVTGId1p3YkHLr3bPtYHv59d0YD/y693s48/u5NN8aUmBb1Dq38mWh26Sg2l+bEz4+Pbx7+yFdFbYwpadj3dtWDR5ZUWUhWuMe2C7saGilX6too9xXDrOx7z+v94SAAACvElEQVR4nO3dWU4cQRBF0aYaaMA2ow2Yef+r9Id/o4Qy474XJYi7gM6jVKqH6lDVbtd1Xdd1Xdd1Xdd136PnvaqXaLmz09XuB9Tni6jnEH203mED6mH0FtTj6A2oj8fR9eoZdLl6Cl2tnkMXqyfRteo/k+hS9TS6Un05jS5Uz57pUvXEJ2K9+iaDrlLn0EXq6xy6Rv2QRJeo0+gKdR5doH7No/Pq/fFYbwA6r74deIG1RtGbUA+jt6AeR29APYGuV8+gy9VT6KOzWrUeLVAb0Lz6woDG1RY0rfagYbUJHavD6wMbQqNqG5pU+9DguZ5D/5hZilM70ZjaiqbOtRcNqc1oRu1GI2o7mlD70YC6AJ1XV6DT6hJ0Vs2h78LLbhI1iD4/calB9PviUqNol5pFm9Qg+nFxqWm0Rc2hf/9HO9TgTu8Xlxo/Hg61Ai1Xg2d6v7jUGrRYLUJr1Sq0VC1DK9U6tFAtROvUSrRMLUWr1Fp0Xh0OXoG/xi+jRbPqcNaUvITwV6CWoxVqPVqgDgdk4StMuBpEX60uSqvDqV4aTavDAVkcDatNaFbtQqNqG5pU+9Cg+smH3v2i1OAXpk/RmNqKptReNKQ2oxm1G42o7WhC7Ufn1SfO92lM/VGAzquj5qZ6B/4bV6jlaIVajxaoDWhe7UDjaguaVnvQsNqEZtUuNKq2oUm1Dw2qjWhO7URjaiuaUnvRkNqMZtRuNKK2owm1Hw2oC9B5dQU6rz7MoH/m0DXqLLpEnUZXqPPoAjWA9qtD9Ovg/UaioRalOkRfR4jhdGohWqdWomVqKVql1qJFajFao1ajJWo5WqHWowVqA5pXO9C42oKm1SH6gUbDas9Ow+rw/h78TrPqEC3YaVRt22lSbURzat/xANUh+kmEHlLfrz+sIUS/yJ4lEQ5Rd13XdV3XdV3Xdd0X7B9LTmYBbBNi2AAAAABJRU5ErkJggg=="/>
                <img className="player-profile ms-3"src={buildProfileUrl(teamData.midId)} alt={teamData.teamMid}/>
            </label>
            <div className="col">
                <input type="text" className={`form-control ${teamClass.teamMid}`} 
                            name="teamMid" value={teamData.teamMid}
                            onChange={changeTeamNameValue}
                            onBlur={checkTeamMid}  
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">미드 스트리머 불일치</div>
            </div>
        </div>
        {/* AD */}
        <div className="row mt-2 ms-1 d-block">
            <label className="col col-form-label d-flex justify-content-center">
                <img className="line-image ms-2"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIgAAACICAMAAAALZFNgAAAAqFBMVEX///+Zg12Zg16Zg1vHq2zHq26ZhFrHqnDHqXTHqnK+rXrJqXCVg2fErWzGqmvGqW2VhGbBq3zBrHibgWHErWiXg2G+rnahkXmbi2+hknaZgWaZhFWbgWCbinDQyL2ZgWnJrGSomoGWgW+RhG3Jp3rBqoDMqWjdzqnErXPd0bLgz7jd077ArWu6r3GPh2HPybvcxZ3Hp4LbzKKLh2qTh1fe2dPbzKC7rYLubDZbAAAFVElEQVR4nO3aj5eaNgAHcIGE8EMERNyGbGfVU8/rXW+3rvv//7MlIQjBIAkX9Lbyfa+vz2LJx4SEBDKZjBkzZsyYMWPGfLJsp0UilmlLpI9vt+SU281m+4cSZGqSGIZl2baFY+CYF5E7jmMmWZakqWFmD2oO7ZDsIctSw7ZTRUcdYnUU1HW8DjG+KTpqkKKQ9oK6jp+bJsNNo+zQDcHHUnyNqDsmU3byZkFGIx3HabMRyWplm5Hq9aEPQi9l/DetFeXrlCaiBZR/ymo//0h2gV4/TipjtbLM1LSMJBE6DjeEGGmeWoZ4/HhzuiG2XSusKog1OUnX8eIrRp5giLhdDn6sAjH4grhirh4n1wfuLEmSm0LHkyMDEXZLEaT9OIGkeZ7jMUTo+HO3P94Mgq/UVHx9HJydA+Y3gtCvmML6ePN9APxHVUjauKtHLbf/i+PkKyLH+36/X69hN2TK18a08z+o5R3swxAsFt6dIQcAAIQYsrwv5OCiTwE5HB03BAiBQAbC3891Qg7B0XEgRAjeF/IUBMhxlSGshfRBTrs5hG5vSKTNgcdThK8PigHSkPNtXRfk5OAgUhvIxV3nbpATLh4D0BkiMaDx8ws9kOe54zKJ7ytD6M3rVy2O5dwpJb5PmuhOkOVXDEFFCMSFwX0gLws8pKLiCsGOEUIhRcNAeNem8YKji8IwhPDOkPjojhAegqijL4RGCPnr9VXw7IxOmLetkNlsRuaJWiGv37/bZp7Ukufspi28JfSD1B47tEPw+olPaW+BoGEgEa6PnGeY1+7WMURwpgppPJb4XYg107IpuFlU20QqxhfpMBBcHRePkK5MLeegD4R//iGGJKoQAD4CMYaAhGpNc15kaYOUA1ooOzEaHiI5VWxAfvm/Q5QX4Z2Q6pFnB4RNjAhEboE1DASiCiK55Pw5IEgBwj+W0ASBELEFlm7IudMMDmEnFkPyHpC+TcNO/JsYYipByDQAKXdf/rGEGHL5Hsm4DkFIfUCTgrQ5pCHKz0eEkMg0LGVIMQ0APSD2FYj1AUi/5yODQPqs9HRDei85Pzdk275fQ7zk7LOukYGopte6ZghIr3VNA/JlhAwDqSbP/0FIMR6wm7t+iPwQzxzF/g9rAIjkNCBiVcH2f+iDqE6MKgjd/6ELUs3QQslXaVH5ar/Y/6EdQqpG6nVrxO//uDfELvd//K0botg0Ntv/ocXRb8kZVRtATD31MZl4ZadRgtBxBFeJYaeaHBMv6NF9tykd49Mk0+agEFhG9r3vJssIRdv1QRIvLiDdQ/zmIctMsv9Un2MSX9aIPKTX/sKWzDmI5E1vm02jNBU6nr2Xl5flcul53jw+Z07T/MyCv4r/JQiIgKxqsMeVnQbQ1w1Cx/LrgqY4YRkARJ/LBMEiCAI8jJQQJAt5XdmpcP/pCf/A4xGftCgVlQ88yhqvfQaN1MHSkKhl/+kzIhsvHDwasRPzDu5zVXrISj/j5CEb8f7Tk+OSMxQvCclEeBbSzPifXTPwUKAOEe4vPNHdDuTMZwhLsxlKCN90QB0i3M//tNt9BFI/JA0R7rcM5reHCB0BOSXbmiPoFaoQqQHtMk/HI+4qZGzWAAHSQ/xlfbhFr4VVH5CB1KMFcgC0VRHduqUP0j0NaOQHXhn5RSX7NKFkfJYmSXpixOd9vccnow7X7xVUDyRCyakil8N+77ssTjHES0f4fYVn8ZzDxRBHY8jbCdnlRN2xc9ZrIF8H3aHXu+QCq8qb6/gY0uwCHwuQ3mp8zg+ybZz2uEBb8LmUIe8OmQfFj7GnNXhS+RjH3vIfhaYZM2bMmDFjxoy5Sf4FUs28+x/DaCAAAAAASUVORK5CYII="/>
                <img className="player-profile ms-3"src={buildProfileUrl(teamData.adId)} alt={teamData.teamAd}/>
            </label>
            <div className="col">
                <input type="text" className={`form-control ${teamClass.teamAd}`} 
                            name="teamAd" value={teamData.teamAd}
                            onChange={changeTeamNameValue}
                            onBlur={checkTeamAd}  
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">원딜 스트리머 불일치</div>
            </div>
        </div>
        {/* SUP */}
        <div className="row mt-2 ms-1 d-block">
            <label className="col col-form-label d-flex justify-content-center">
                <img className="line-image ms-2"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALUAAAC1CAMAAAAujU6bAAAAllBMVEX////Iqm2+qHrx6tr8+va/qHjBqHbGqW7EqXLFqXDCqHT7+PPr5dr+/fvDqHLCqXTcyaPMsHi9qX/38unGtI/ArorRt4Xs4czVvY/h0bDk28j17+Pq4dG/q4O4poDTyLDv5tTKvKO/rY3KvJ/Rw6by7+vg29Dj2MLVxaPGtpXaz7rr6eG+rIu6qIbVz8Pn2sHZxZzh0a+K4Gu3AAAGkklEQVR4nO2biVKjQBCGMxgCCTlWkuia06jRjVf0/V9uwRzQQ/ccLGR6q/irrLIyCH9N5uvpbsZWq1GjRo0aNWrUqFGjRry09PPyKHXCcOvaaqaXQJhq6tprptjYtAhmrs2e9Go+1ULEA9d2DxpYTHWijWu/B62tTAt/7NpwqrZn51o8uHac6tHStBg+u7acTLVv61qsXHtutXbWpkXw6tq0Taw+K3ZtuvXatZ/rJ9emS9Aodq4tp5paml6y2B0HdgHbi1wbPmjbszDtv7m2e9KzOZE9NjmfRSrSZRA+MpnuNSzCR6alkWke4SOTUSDhEj4ybfVZ1Gju2mRRz6HGdPji2iImTSAJ/rg2iEsdSCau7VFSBRIutTkimkh+4SPTmMpIfIbhI9MCDyScsg9Ma6wPxSv7wIQFktqyj3Y0nl/Rms/H43EURW19JCgGkhr6qLOPVaI4JpvOpOI+esOBHEjiNnpdf5iMBUE3URiGw2Fv1OskUnbAfT+9YpVssmvdTkzKw22Ph/AqvK/XH5V9bG+R/v2bbaPuLB+3PcsT6S1w0zZVG9B5FiY2DWgD20/ZFSO8z1Te9CQja9YpeY8ObntyGu8+VmsaTsK4TONLYftEJN71LW06lgv8nX3nS2G7fWANr7jKmg52xdstSkKJ2x6nd8NTprKmO2haMCg53T3Udt8nWO2XZGiKh/3SUI5Qd68eWnGVNN1RlG/tcjEQXyRVzrSmEHoptbqJSFKV6Q6+U+U02JTZ4TtmPcdSpkOjPHc7LeHbaLbLmO5OTGu3t3d73wazXcJ0sDRdez8PeB/qbwmlbUz3rd/xhUvtgpb09mA7M2vNHS3fXIvO1NZzqu3OKp4Mdesvsvn6Am9XtqwfvH6Yf6v6l4jmGZr/Pvunps928xGb7Tz6ktasNd/1pmtq87ZQ9Pn48JCUlsfSLflBv2r9IlzQVsOkIvTj1cf08ckmaGjVzmr4xSeStfn5i2/Pv+3zHyPLLfxcHJoA4wrmV60VMlv59kFb/Dr+9kvkzWDvUy92fAt9B52Pe3shvo6mxW3uczT2Xagvhfbywnzc+xIH24np86ynirBuQljpQqYUoVEcxL0b8WM7NS1u8gNo7PNrX9EtqrUO4t7hox/vIsgP4OcblvWbJg5W5ONeBEby2wUR+2pf2s/4tgzi3h4M5XFs4TnCsOalTR2DA/HrCwzlcaTOknj1vrShTrCAfO8aDAEcqbyv1qhNnRbqgTAAxwCOEVVu1Li0+9QzQRSIpEHw7VN5X7e2o4ltMtUEPci9NHifHyTzvl5dr/beqScGIAZ8SaMARzrvqylqb8gHeuC6a2kU4Kh4kYo3jf9RRKROBSOAPHoNRulzdN0yZaJGqgPLsBVeGAY4KmreTvUJCbmo5afJMEq7o6rmrTxqbxTFI+RIhlHCUVXzBrrmhKWeVU0GiJEMo4yjquY17nIaKfpQPKoLH1W8AOKoqHmFWFW5tF9ULyVg3CvCKOHYUvW0RpUebmhvYvL1B2ToDrkC4Kg4seOtK8/93qgGGnwP+hu5AuJIxL5wUk+WPVhj/EtlXxFGGccI+da68V2NKXa/2JGX8gdsGiGOxYKmN6n9P3+epIfCzBiDUQj4dUixz6s4ShPqT3L7Wwc2bDEYpWQVxL5wcrlzXINswqV/2cFgFOIbXnSKfd24+qCh1mJ6eLbUAMZglHE85n3DC05zpmiTTPhQ2hZQ0zKOSezrxU+XaDmhmi2lLXiOu5Z2xyieXF3SZkFStYfDKOMo/5Vr4TDKuyM34TAWcGQmwjRs5XATBaOMIy9RMMrJKi9RMPLGkYKRN46kac440jByxpGGkTOONIyccaRh5IyjwjRfHFUw8sVRBSNfHFUw8sVRBSNfHJWmueJ4pXYtnFW3Sn1rXPPEUQ0jVxzVMHLFUWNaCNcGMal3xlQccVTvjKk44qiDkSeOOhh54qg1zXF31MPIEUc9jBxx1MPIEUc9jBxxNDDND0cTGPnhaAIjPxxNYOSHowmM/HA0Ms0NRzMYueFoBiM3HM1g5IajGYzccDQ0zQtHXQMnE6c36LoGTiZOOJrCyAtHUxh54Xhrajpwe5pF0tgwD+EEYyqTpf2tv82lpV0lwb1ri5g0q4Td6jhqoFolDFfHSXTqd+/amkpzfJVcM10dZ+lPjbNU4f9leMYOWdIq4Ro7ZIFY8h+sjpP2/9fqOOm4Sm541eRa/aySO9cu7LW/ZpWVNmrUqFGjRo0aNWrUiNBf2VJYcYBEtpwAAAAASUVORK5CYII="/>
                <img className="player-profile ms-3"src={buildProfileUrl(teamData.supId)} alt={teamData.teamSup}/>
            </label>
            <div className="col">
                <input type="text" className={`form-control ${teamClass.teamSup}`} 
                            name="teamSup" value={teamData.teamSup}
                            onChange={changeTeamNameValue}
                            onBlur={checkTeamSup}  
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">서폿 스트리머 불일치</div>
            </div>
        </div>
    </div>
    <hr/>
    {/* 감독/코치 등록 */}
    <button type="button" className="btn btn-outline-primary mt-2" onClick={addStaffRow}>
    + 감독/코치 추가
    </button>
    {staffList.map((staff, idx) => (
    <div key={idx} className="row mt-2 ms-1 d-flex">
        <label className="col-2 col-form-label d-flex justify-content-center">
            <img className="player-profile ms-3"src={buildProfileUrl(staff.staffSoopId)}/>
        </label>
        <div className ="col-2">
            <select className={`form-control`} name="staffRole" onChange={(e) => changeStaffValue(idx, e)} onBlur={checkStaff}>
            <option value=""> - 선택 - </option>
            <option value="감독">감독</option>
            <option value="코치">코치</option>
          </select>
        </div>
        <div className="col-6">
            <input type="text" className={`form-control`} 
                        name="staffName" value={staff.staffName}
                        onChange={(e) => changeStaffValue(idx, e)}
                        onBlur={()=>checkStaff(idx)}
                        />
        </div>
        <button type="button" className="col-2 btn btn-danger"
            onClick={() => removeStaffRow(idx)} disabled={staffList.length === 1}>삭제
        </button>
    </div>
    ))}
  
    {/* 등록버튼  */}
    {isLogin === true &&(
    <div className="row mt-4">
        <div className="col">
            <button type="button" className="btn btn-lg btn-insert w-100"
                        disabled={teamValid === false||checking}
                        onClick = {sendData}
                        >
            <span>등록</span>
            </button>
        </div>
    </div>
    )}
</div>
</>)
}