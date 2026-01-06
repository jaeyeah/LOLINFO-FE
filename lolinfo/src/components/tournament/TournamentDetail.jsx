import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";

export default function TournamentDetail(){
    const {tournamentId} = useParams();
    const [tournament, setTournament] = useState({});
    const [team, setTeam] = useState([]);

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/tournament/${tournamentId}`); 
            setTournament(data);
            // console.log("대회 데이터:"data);
        } catch (error) {
            console.error("Error fetching tournament list:", error);
        }
    }, []); 

    const loadTeamData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/team/${tournamentId}`);
            setTeam(data);
            console.log("팀 데이터:",data);
        } catch (error) {
            console.error("팀 로딩 오류");
            console.error("Error fetching team list:", error);
        }
    }, []);

    useEffect(()=>{
        loadData();
        loadTeamData();
    },[]);


    


    //render
    return(<>
        <h2 className="text-center page-title p-3">{tournament.tournamentName} : 대회 상세</h2>
        <div className="col text-end">
            <Link to={`/team/insert/${tournamentId}`} className="btn btn-success">등록</Link>
        </div>
        
        
        <div className="team-list mt-4">
        {team.map((team) => (
            <div className={`team-card
                ${team.teamRanking === "우승" ? "is-champion" : ""}
                ${team.teamRanking === "준우승" ? "is-second" : ""}`}
                key={team.teamId}>
            {/* 상단 헤더 : 순위 + 팀 이름 */}
            <div className="team-header d-flex align-items-center mb-3">
                <div>#{team.teamRanking} | {team.teamName && <span className="team-name">{team.teamName}</span> }</div>
            </div>

            {/* 선수 목록 */}
            <div className="player-list">
                <div className="player-row">
                    <span className="badge"> 탑 </span>
                    <Link to={`/streamer/${team.teamTop}`} className="btn btn-link" target="_blank" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.topId)} alt={team.topName}/>
                        <span className="player-name ms-2">{team.topName}</span>
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">정글</span>
                    <Link to={`/streamer/${team.teamJug}`} className="btn btn-link" target="_blank" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.jugId)} alt={team.jugName}/>
                        <span className="player-name ms-2">{team.jugName}</span>
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">미드</span>
                    <Link to={`/streamer/${team.teamMid}`} className="btn btn-link" target="_blank" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.midId)} alt={team.midName}/>
                        <span className="player-name ms-2">{team.midName}</span>
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">원딜</span>
                    <Link to={`/streamer/${team.teamAd}`} className="btn btn-link" target="_blank" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.adId)} alt={team.adName}/>
                        <span className="player-name ms-2">{team.adName}</span>  
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">서폿</span>
                    <Link to={`/streamer/${team.teamSup}`} className="btn btn-link" target="_blank" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.supId)} alt={team.supName}/>
                        <span className="player-name ms-2">{team.supName}</span>
                    </Link>
                </div>
            </div>
            </div>
        ))}
        </div>
</>)}