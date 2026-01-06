import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Tournament.css";
import { buildProfileUrl } from "../../utils/profileUrl";

export default function TournamentList(){

    const [tournamentList, setTournamentList] = useState([]); 

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get("/tournament/"); 
            setTournamentList(data);
        } catch (error) {
            console.error("Error fetching tournament list:", error);
        }
    }, []); 

    useEffect(()=>{
        loadData();
    },[]);


    function formatDate(value) {
      const d = new Date(value);
      const yy = String(d.getFullYear()).slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}년 ${mm}월${dd}일`;
  }


//render
return(<>
  <h2 className="section-title text-center ">Soop : LoL 대회 목록</h2>
  <div className="row text-end">
    <div className="col-8"></div>
    <div className="col-4">
      <Link to="/tournament/insert" className="btn btn-success">등록</Link>
    </div>
  </div>
  
  <div className="row mt-3">
    <div className="col-12 tournament-wrapper">
      {tournamentList.map((tournament) => (
        <Link
          to={`/tournament/${tournament.tournamentId}`}
          key={tournament.tournamentId}
          className="card tournament-card mb-3"
        >
          <div className="row g-0 tournament-row">
            {/* 연도 */}
            <div className="col-md-2 col-3 year-tag">{tournament.tournamentYear}</div>

            {/* 가운데 내용 */}
            <div className="col-md-4 col-9">
              <div className="card-body py-3">
                <div className="tournament-top">
                  <span className={`tier-text badge ${tournament.tournamentTierType === "통합" ? "all-tier" : tournament.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier" }`}> {tournament.tournamentTierType}</span>
                  {/* 공식 대회 여부 : 배지 */}
                  {tournament.tournamentIsofficial === "Y" && (
                    <span className="badge official-badge ms-2">공식</span>
                  )}
                  {tournament.tournamentName?.includes("멸망전") && (
                    <span className="badge official-badge2 ms-2">멸망전</span>
                  )}
                </div>
                {/* 대회명 */}
                <h5 className="tournament-title mt-2">
                  {tournament.tournamentName}
                </h5>
                {/* 기간 */}
                {tournament.tournamentStart && (
                <span className="period-text">
                  {formatDate(tournament.tournamentStart)} ~ {formatDate(tournament.tournamentEnd)}
                </span>
              )}
              </div>
            </div>
            <div className="col-md-6 col-12 period-box ">
              <div className="period-box-header team-badge">
                <div className="col">
                  <span className="text-light fs-5">{tournament.teamName}</span>
                </div>
              </div>
              <div className="period-box-body">
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.topId)} alt={tournament.topName}/>
                  <br/><span className="player-name">{tournament.topName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.jugId)} alt={tournament.jugName}/>
                  <br/><span className="player-name">{tournament.jugName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.midId)} alt={tournament.midName}/>
                  <br/><span className="player-name">{tournament.midName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.adId)} alt={tournament.adName}/>
                  <br/><span className="player-name">{tournament.adName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.supId)} alt={tournament.supName}/>
                  <br/><span className="player-name">{tournament.supName}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
      </>)
  }