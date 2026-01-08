import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";

export default function TournamentInsert(){
  const navigate = useNavigate();
  const [tournament, setTournament] = useState({
    tournamentName : "", tournamentYear : "",
    tournamentStart : "", tournamentEnd : "",
    tournamentIsofficial : "",tournamentTierType : "",
  });
  const [tournamentClass, setTournamentClass] = useState({
    tournamentName : "", tournamentYear : "",
    tournamentStart : "", tournamentEnd : "",
    tournamentIsofficial : "",tournamentTierType : "",
  });
  const [hostList, setHostList] = useState([
    {hostStreamer : "", hostName : "", hostSoopId : ""}
  ])
  const addHostRow = useCallback(() => {
    setHostList(prev => [...prev, { hostStreamer: "", hostName: "" }]);
  }, []);
  const removeHostRow = useCallback((index) => {
    setHostList(prev => prev.filter((_, i) => i !== index));
  }, []);

  // callback
  const changeStrValue = useCallback(e=>{
      const {name, value} = e.target;
      setTournament(prev=>({...prev, [name]:value}))
    },[])
  const changeHostValue = useCallback((index,e)=>{
    const {name, value} = e.target;
    setHostList(prev =>
      prev.map((h, i) => (i === index ? { ...h, [name]: value } : h))
    );
  },[])

  //유효성검사
  const checkTournamentName = useCallback(e=>{
    const valid = tournament.tournamentName.length > 0;
    setTournamentClass(prev=>({...prev, tournamentName : valid ? "is-valid" : "is-invalid"}));
  },[tournament, tournamentClass])
  const checkTournamentYear = useCallback(e=>{
    const regex = /^(19|20)\d{2}$/;
    const valid = regex.test(tournament.tournamentYear) && tournament.tournamentYear.length > 0;
    setTournamentClass(prev=>({...prev, tournamentYear : valid ? "is-valid" : "is-invalid"}));
  },[tournament, tournamentClass])
  const checkTournamentIsofficial = useCallback(e=>{
    const valid = tournament.tournamentName.length > 0;
    setTournamentClass(prev=>({...prev, tournamentIsofficial : valid ? "is-valid" : "is-invalid"}));
  },[tournament, tournamentClass])
  const checkTournamentTierType = useCallback(e=>{
    const valid = tournament.tournamentName.length > 0;
    setTournamentClass(prev=>({...prev, tournamentTierType : valid ? "is-valid" : "is-invalid"}));
  },[tournament, tournamentClass])

  // 개최자 검사
  const checkHost = useCallback(async(idx)=>{
    const name = hostList[idx]?.hostName;
    if(!name) return;
    try{
      const {data} = await axios.get(`/team/check/${name}`);
      console.log("전송된 데이터", data);

     setHostList(prev => prev.map((h, i) =>
        i === idx ? { ...h, hostStreamer: data.streamerNo, hostSoopId: data.streamerSoopId } : h
      )
    );}
    catch(err){
      console.log("err",err);
    }
  },[hostList])





    //memo (유효성검사)
    const tournamentValid = useMemo(()=>{
        //필수항목
        if(tournamentClass.tournamentName !== "is-valid") return false;
        if(tournamentClass.tournamentYear !== "is-valid") return false;
        if(tournamentClass.tournamentStart === "is-invalid") return false;
        if(tournamentClass.tournamentEnd === "is-invalid") return false;
        if(tournamentClass.tournamentIsofficial !== "is-valid") return false;
        if(tournamentClass.tournamentTierType !== "is-valid") return false;
        return true;
    },[tournamentClass])

    // 전송 함수
    const sendData = useCallback(async()=>{
        if(tournamentValid === false) return ;
        try{
            const payload = {
              tournamentDto : tournament,
              hostDto : hostList.map(h=>({hostStreamer : h.hostStreamer}))
            }
            const response = await axios.post("/tournament/",payload);
            console.log("성공", response);
            navigate("/tournament"); // 메인페이지
        }
        catch(err){
            console.error("대회 등록 실패", err);
        }
    },[tournament, tournamentValid, hostList])

    //render
return(<>   
<div className="d-flex justify-content-center">
    <div className="insert-form">
      <div className="text-center">
        <h2 className="">대회 등록</h2>
      </div>
      <hr/>
      {/* 대회 이름 */}
      <div className="row mt-4">
        <label className="col-sm-3 col-form-label">대회명 <FaAsterisk className="text-danger"/></label> 
        <div className="col-sm-9">
          <input type="text" className={`form-control`}
                name="tournamentName" value={tournament.tournamentName}
                onChange={changeStrValue} onBlur={checkTournamentName}/>
          <div className="valid-feedback"></div>
          <div className="invalid-feedback"></div>
        </div>
      </div>
      {/* 대회 연도 */}
      <div className="row mt-4">
        <label className="col-sm-3 col-form-label">대회 연도 <FaAsterisk className="text-danger"/></label> 
        <div className="col-sm-9">
          <input type="text" className={`form-control`}
                name="tournamentYear" value={tournament.tournamentYear}
                onChange={changeStrValue} onBlur={checkTournamentYear}/>
          <div className="valid-feedback"></div>
          <div className="invalid-feedback"></div>
        </div>
      </div>
      {/* 대회 시작일 */}
      <div className="row mt-4">
        <label className="col-sm-3 col-form-label">시작일</label> 
        <div className="col-sm-9">
          <input type="date" className={`form-control`}
                name="tournamentStart" value={tournament.tournamentStart}
                onChange={changeStrValue}/>
          <div className="valid-feedback"></div>
          <div className="invalid-feedback"></div>
        </div>
      </div>
      {/* 대회 종료일 */}
      <div className="row mt-4">
        <label className="col-sm-3 col-form-label">종료일</label> 
        <div className="col-sm-9">
          <input type="date" className={`form-control`}
                name="tournamentEnd" value={tournament.tournamentEnd}
                onChange={changeStrValue}/>
          <div className="valid-feedback"></div>
          <div className="invalid-feedback"></div>
        </div>
      </div>
      {/* 대회 공식 */}
      <div className="row mt-4">
        <label className="col-sm-3 col-form-label">공식/비공식 <FaAsterisk className="text-danger"/></label> 
        <div className="col-sm-9">
          <select className={`form-control`} name="tournamentIsofficial" onChange={changeStrValue} onBlur={checkTournamentIsofficial}>
            <option value=""> - 선택 - </option>
            <option value="Y">공식</option>
            <option value="N">비공식</option>
          </select>
          <div className="valid-feedback"></div>
          <div className="invalid-feedback"></div>
        </div>
      </div>
      {/* 대회 구분 */}
      <div className="row mt-4">
        <label className="col-sm-3 col-form-label">구분 <FaAsterisk className="text-danger"/></label> 
        <div className="col-sm-9">
          <select className={`form-control`} name="tournamentTierType" onChange={changeStrValue} onBlur={checkTournamentTierType}>
            <option value=""> - 선택 - </option>
            <option value="통합">통합</option>
            <option value="천상계">천상계</option>
            <option value="지상계">지상계</option>
          </select>
          <div className="valid-feedback"></div>
          <div className="invalid-feedback"></div>
        </div>
      </div>
      <hr/>
      {/* 개최자 등록 */}
      <button type="button" className="btn btn-outline-primary mt-2" onClick={addHostRow}>
        + 개최자 추가
      </button>
      {hostList.map((host, idx) => (
        <div key={idx} className="row mt-2 ms-1 d-block">
          <label className="col col-form-label d-flex justify-content-center">
                <img className="line-image ms-2"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALUAAAC1CAMAAAAujU6bAAAAWlBMVEX///9iTCfIqm7Vv5HYwphxXj2RgmiGdVnMsXqAb1GilYB5ZUb28uj6+PPRuIfQt4S0qZj59u/18Oa4r5/i0rLaxp/b1s6ajXaekHqXiHGLe2HLxLisoI7Lr3cSjjjOAAACAElEQVR4nO3c607DMAxA4ZXB2MZl3DYYl/d/TX4CXTFNbMeOOOcB2k9WWrVSlMWCiIiIiIiI6H/0tAxtf1OlPj+LbH1dN+tQ9fq+Dh2q3tWiI9X16EC1Ah2n1qDD1Cp0lHpX956OVSvRMepbJTpErUZHqPXoALUBur3aAt1cbYJurRbQh7RqAb29zKqW0MMmqVpAPw9Z1QL6OGRVy5NOqhbQL0NWtfCVdxyyqgX0asiqFtCvQ1b1HLSRel1wleq+0B2pL4cO1d/R3ah/oHtR/0R3oh6h+1CP0V2oN2N0D+pTdAfqk+XRg/p5Ap1fPTVq1D6hRi2HGrUcatRyqFHLxajfVjN6z6beTt113BVq1KhRo0aNGjVq1KhRo0aNGjVq1KhRo0aNGjVqrfruYkarbGptqFHLoUYthxq1nKN66YZ2VGsPcJByU3ui3dSuaC+1L9pJrTv+5e9c1NWHR83NQ+2O9lD7ox3UDdD26tpT3IqyVjdBW6vXD27S79mqP9qgbdWt0KbqRstjYaoWHsTHOfutC7owUwvou6mbmFejDkfXqOPRFeoE6HJ1BnSxOgW6VJ0DXahOgi5TZ0EXqfe//wS0RRepf68x2kb92Bhtom49aRN180lbqAPQenUEWq0OQWvVMWilOgitU0ehVerD1Zy9Hx4dNbMmIiIiIiIi6qhPfE9aaQteWwMAAAAASUVORK5CYII="/>
                <img className="player-profile ms-3"src={buildProfileUrl(host.hostSoopId)}/>
            </label>
            <div className="col">
                <input type="text" className={`form-control`} 
                            name="hostName" value={host.hostName}
                            onChange={(e) => changeHostValue(idx, e)}
                            onBlur={()=>checkHost(idx)}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">탑 스트리머 불일치</div>
              <button type="button" className="btn btn-outline-danger"
                onClick={() => removeHostRow(idx)} disabled={hostList.length === 1}>삭제
              </button>
            </div>
        </div>
      ))}

      {/* 등록 버튼 */}
      <div className="row mt-4">
        <div className="col">
          <button type="button" className="btn btn-lg btn-insert w-100"
                      disabled={tournamentValid === false}
                      onClick = {sendData}
                      >
            <span>등록</span>
          </button>
        </div>
      </div>
    </div>
</div>   
</>)
}