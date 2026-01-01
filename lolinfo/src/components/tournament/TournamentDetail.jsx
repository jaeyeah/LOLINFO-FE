import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
        <h2 className="text-center">{tournament.tournamentName} 상세</h2>

        <div className="team-list mt-4">
        {team.map((team) => (
            <div className={`team-card
                ${team.teamRanking === "우승" ? "is-champion" : ""}
                ${team.teamRanking === "준우승" ? "is-second" : ""}`}
                key={team.teamId}>
            {/* 상단 헤더 : 순위 + 팀 이름 */}
            <div className="team-header d-flex align-items-center mb-3">
                <div>#{team.teamRanking} | {team.teamName} </div>
            </div>

            {/* 선수 목록 */}
            <div className="player-list">
                <div className="player-row">
                    <span className="badge"> 탑 </span>
                    <img className="player-profile ms-2"src={buildProfileUrl(team.topId)} alt={team.topName}/>
                    <span className="player-name">{team.topName}</span>
                </div>
                <div className="player-row">
                    <span className="badge">정글</span>
                    <img className="player-profile ms-2"src={buildProfileUrl(team.jugId)} alt={team.jugName}/>
                    <span className="player-name">{team.jugName}</span>
                </div>
                <div className="player-row">
                    <span className="badge">미드</span>
                    <img className="player-profile ms-2"src={buildProfileUrl(team.midId)} alt={team.midName}/>
                    <span className="player-name">{team.midName}</span>
                </div>
                <div className="player-row">
                    <span className="badge">원딜</span>
                    <img className="player-profile ms-2"src={buildProfileUrl(team.adId)} alt={team.adName}/>
                    <span className="player-name">{team.adName}</span>
                </div>
                <div className="player-row">
                    <span className="badge">서폿</span>
                    <img className="player-profile ms-2"src={buildProfileUrl(team.supId)} alt={team.supName}/>
                    <span className="player-name">{team.supName}</span>
                </div>
            </div>
            </div>
        ))}
        </div>
</>)}