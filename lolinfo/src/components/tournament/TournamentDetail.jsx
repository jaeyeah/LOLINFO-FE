import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";


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
        <h2>대회 상세</h2>
        <div> 대회 : {tournament.tournamentName}</div>

        <div className="team-list">
            {team.map((team) => (
                <div className="team-card" key={team.teamId}>
                <div className="team-header">
                     {team.teamRanking} | {team.teamName}
                </div>

                <div className="player-grid-2row">

                    {/* 1️⃣ 포지션 라벨 */}
                    <div className="row-label">탑</div>
                    <div className="row-label">정글</div>
                    <div className="row-label">미드</div>
                    <div className="row-label">원딜</div>
                    <div className="row-label">서폿</div>

                    {/* 2️⃣ 포지션별 선수 이름 */}
                    <div className="row-value">{team.topName}</div>
                    <div className="row-value">{team.jugName}</div>
                    <div className="row-value">{team.midName}</div>
                    <div className="row-value">{team.adName}</div>
                    <div className="row-value">{team.supName}</div>

                </div>
                </div>
            ))}
            </div>
    </>)
}