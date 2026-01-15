import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { useAtomValue } from "jotai";
import { loginState } from "../../utils/jotai";

export default function TournamentInsert(){
  const navigate = useNavigate();
  const {tournamentId} = useParams();
  const isLogin = useAtomValue(loginState);
  // State
  const [tournament, setTournament] = useState({
    tournamentName : "", tournamentYear : "",
    tournamentStart : "", tournamentEnd : "",
    tournamentIsofficial : "",tournamentTierType : "",
  });
  const [tournamentClass, setTournamentClass] = useState({
    tournamentName : "is-valid", tournamentYear : "is-valid",
    tournamentStart : "is-valid", tournamentEnd : "is-valid",
    tournamentIsofficial : "is-valid",tournamentTierType : "is-valid",
  });
  const [hostList, setHostList] = useState([
    {hostStreamer : "", hostName : "", hostSoopId : ""}
  ])

  // 초기데이터
  const loadData = useCallback(async()=>{
    const {data} = await axios.get(`/tournament/${tournamentId}`)
    setTournament(data);
    console.log(data);
  })

  useEffect(()=>{
    loadData();
  },[])


  // callback
  const changeStrValue = useCallback(e=>{
      const {name, value} = e.target;
      setTournament(prev=>({...prev, [name]:value}))
    },[])
  const changeHostValue = useCallback((index,e)=>{
    const {name, value} = e.target;
    setHostList(prev =>
      prev.map((host, i) => (i === index ? { ...host, [name]: value } : host))
    );
  },[])
    // 개최자 칸 추가/삭제
    const addHostRow = useCallback(() => {
      setHostList(prev => [...prev, { hostStreamer: "", hostName: "" }]);
    }, []);
    const removeHostRow = useCallback((index) => {
      setHostList(prev => prev.filter((_, i) => i !== index));
    }, []);

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
            console.log("페이로드",payload);
            const response = await axios.put(`/tournament/${tournamentId}`,payload);
            console.log("성공", response);
            navigate(`/tournament/${tournamentId}`); // 메인페이지
        }
        catch(err){
            console.error("대회 수정 실패", err);
        }
    },[tournament, tournamentValid, hostList])

    //render
return(<>   
<div className="d-flex justify-content-center">
    <div className="insert-form">
      <div className="text-center">
        <h2 className="">대회 수정</h2>
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
        <div key={idx} className="row mt-2 ms-1 d-flex">
          <label className="col-3 col-form-label d-flex justify-content-center">
                <img className="player-profile ms-3"src={buildProfileUrl(host.hostSoopId)}/>
            </label>
            <div className="col-7">
              <input type="text" className={`form-control`} 
                          name="hostName" value={host.hostName}
                          onChange={(e) => changeHostValue(idx, e)}
                          onBlur={()=>checkHost(idx)}
                          />
            </div>
            <button type="button" className="col-2 btn btn-danger"
              onClick={() => removeHostRow(idx)} disabled={hostList.length === 1}>삭제
            </button>
        </div>
      ))}
      {/* 등록 버튼 */}
      {isLogin === true &&(
      <div className="row mt-4">
        <div className="col">
          <button type="button" className="btn btn-lg btn-insert w-100"
                      disabled={tournamentValid === false}
                      onClick = {sendData}
                      >
            <span>수정</span>
          </button>
        </div>
      </div>
      )}
    </div>
</div>   
</>)
}