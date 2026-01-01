import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Tournament.css";


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
        <h2 className="section-title">대회 목록</h2>

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
          <div className="col-md-6 col-9">
            <div className="card-body py-3">
              <div className="tournament-top">
                <span className="tier-text"> {tournament.tournamentTierType}</span>
                {/* 공식 대회 여부 : 배지 */}
                {tournament.tournamentIsofficial === "Y" && (
                  <span className="badge official-badge ms-2">공식</span>
                )}
              </div>

              <h5 className="tournament-title mt-1">
                {tournament.tournamentName}
              </h5>
            </div>
          </div>

          {/* 기간 */}
          <div className="col-md-4 col-12 period-box">
            {tournament.tournamentStart && (
              <span className="period-text">
                {formatDate(tournament.tournamentStart)} ~ {formatDate(tournament.tournamentEnd)}
              </span>
            )}
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>
    </>)
}