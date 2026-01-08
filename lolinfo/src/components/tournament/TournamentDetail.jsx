import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function TournamentDetail(){
    const {tournamentId} = useParams();
    const [tournament, setTournament] = useState({});
    const [team, setTeam] = useState([]);
    const [hostList, setHostList] = useState([]);

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/tournament/${tournamentId}`); 
            setTournament(data);
            console.log("대회정보",data);
        } catch (error) {
            console.error("Error fetching tournament list:", error);
        }
    }, []); 

    const loadTeamData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/team/tournament/${tournamentId}`);
            setTeam(data);
            console.log("팀 데이터:",data);
        } catch (error) {
            console.error("팀 로딩 오류");
            console.error("Error fetching team list:", error);
        }
    }, []);

    const loadHostData = useCallback( async() => {
        try{
            const {data} = await axios.get(`/host/tournament/${tournamentId}`)
            console.log("개최자 데이터:",data);
            setHostList(data);
        }catch (err) {
            console.error("개최자 로딩 실패", err);
        }

    }, []); 

    useEffect(()=>{
        loadData();
        loadTeamData();
        loadHostData();
    },[]);


    //render
    return(<>
        <h2 className="text-center page-title p-3">{tournament.tournamentName} : 대회 상세</h2>
        
        {/* 대회 개최자 및 상세 */}
        <div className="streamer-card mb-2">
            <div className="row g-0">
                <div className="col-lg-4 col-12">
                    <h3 className="host-box text-center">주최</h3>
                    <div className="d-flex tournment-host justify-content-center align-items-center gap-2">
                    {hostList.map((host)=>(
                    <Link to={`/streamer/${host.hostStreamer}`} className="streamer-link ms-2">
                        <div className="text-center">
                            <img className="host-profile mb-1"src={buildProfileUrl(host.streamerSoopId)}/>
                            <br/><span className={`stat-box-number `}>{host.streamerName}</span>
                        </div>
                    </Link>
                    ))}
                    </div>
                </div>
                <div className="col-lg-8 col-12 ">
                    <div className="ms-2 stat-box text-center">
                        <span className={`ms-2 stat-box-number ${tournament.tournamentIsofficial !== "Y" && "text-secondary"}`}>공식</span>
                        <span className={`ms-4 stat-box-number ${tournament.tournamentIsofficial !== "N" && "text-secondary"}`}>스트리머개최</span>
                        <hr/>
                        <span className={`ms-2 stat-box-number ${tournament.tournamentTierType !== "천상계" && "text-secondary"}`}>천상계</span>
                        <span className={`ms-4 stat-box-number ${tournament.tournamentTierType !== "지상계" && "text-secondary"}`}>지상계</span>
                        <span className={`ms-4 stat-box-number ${tournament.tournamentTierType !== "통합" && "text-secondary"}`}>통합</span>
                        <hr/>
                        <h6 className="ms-4 stat-box-label">시작일 | {tournament.tournamentStart}</h6>
                        <h6 className="ms-4 stat-box-label">종료일 | {tournament.tournamentEnd}</h6>
                    </div>
                </div>
            </div>
        </div>

        {/*  */}
        <div className="col text-end">
            <Link to={`/team/insert/${tournamentId}`} className="btn btn-success">+TEAM</Link>
            <Link to={`/tournament/edit/${tournamentId}`} className="p-1 fs-5 ms-1 btn btn-warning"><FaEdit/></Link>
        </div>
        
        <div className="team-list mt-4">
        {team.map((team) => (
            <div className={`team-card
                ${team.teamRanking === "우승" ? "is-champion" : ""}
                ${team.teamRanking === "준우승" ? "is-second" : ""}`}
                key={team.teamId}>
            {/* 상단 헤더 : 순위 + 팀 이름 */}
            <div className="team-header">
                #{team.teamRanking}
                {team.teamName && <span className="team-name ms-2 p-1">{team.teamName} </span> }
                {/* 추후, 관리자만 수정가능하도록 지정 */}
                <div className="ms-auto">
                    <Link to={`/team/edit/${team.teamId}`} className="p-1 fs-5 ms-1 btn btn-warning"><FaEdit/></Link>
                    <Link to="/" className="p-1 ms-1 fs-5 btn btn-danger"><MdDelete/></Link>
                </div>
            </div>


            {/* 선수 목록 */}
            <div className="player-list">
                <div className="player-row">
                    <span className="badge"> 탑 </span>
                    <Link to={`/streamer/${team.teamTop}`} className="btn btn-link" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.topId)} alt={team.topName}/>
                        <span className="player-name ms-2">{team.topName}</span>
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">정글</span>
                    <Link to={`/streamer/${team.teamJug}`} className="btn btn-link"  rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.jugId)} alt={team.jugName}/>
                        <span className="player-name ms-2">{team.jugName}</span>
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">미드</span>
                    <Link to={`/streamer/${team.teamMid}`} className="btn btn-link"  rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.midId)} alt={team.midName}/>
                        <span className="player-name ms-2">{team.midName}</span>
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">원딜</span>
                    <Link to={`/streamer/${team.teamAd}`} className="btn btn-link" rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.adId)} alt={team.adName}/>
                        <span className="player-name ms-2">{team.adName}</span>  
                    </Link>
                </div>
                <div className="player-row">
                    <span className="badge">서폿</span>
                    <Link to={`/streamer/${team.teamSup}`} className="btn btn-link"  rel="noopener noreferrer">
                        <img className="player-profile"src={buildProfileUrl(team.supId)} alt={team.supName}/>
                        <span className="player-name ms-2">{team.supName}</span>
                    </Link>
                </div>
            </div>
            </div>
        ))}
        </div>
</>)}