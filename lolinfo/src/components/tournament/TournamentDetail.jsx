import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useAtomValue } from "jotai";
import { adminState, loginState } from "../../utils/jotai";

export default function TournamentDetail(){

    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);

    const {tournamentId} = useParams();
    const [tournament, setTournament] = useState({});
    const [team, setTeam] = useState([]);
    const [hostList, setHostList] = useState([]);
    //로딩중 설정
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadData = useCallback( async() => {
        try {
            setLoading(true);
            setError(null);
            const {data} = await axios.get(`/tournament/${tournamentId}`); 
            setTournament(data);
            //console.log("대회정보",data);
        } catch (error) {
            console.error("Error fetching tournament list:", error);
        }
        finally {
          setLoading(false);
        }
    }, []); 

    const loadTeamData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/team/tournament/${tournamentId}`);
            setTeam(data);
            //console.log("팀 데이터:",data);
        } catch (error) {
            console.error("팀 로딩 오류");
            console.error("Error fetching team list:", error);
        }
    }, []);

    const loadHostData = useCallback( async() => {
        try{
            const {data} = await axios.get(`/host/tournament/${tournamentId}`)
            //console.log("개최자 데이터:",data);
            setHostList(data);
        }catch (err) {
            console.error("개최자 로딩 실패", err);
        }
    }, []); 

    useEffect(()=>{
        loadData();
        loadTeamData();
        loadHostData();
    },[loadData, loadTeamData, loadHostData]);

    const deleteHost = useCallback(async(hostStreamer, hostTournament)=>{
        try{
            await axios.delete(`/host/`,{
                data : {hostStreamer, hostTournament}
            });
            loadHostData();
            console.log("개최자 삭제 실행");
        }catch (err) {
            console.error("개최자 삭제 실패", err);
        }
    })
    const deleteStaff = useCallback(async(staffStreamer, staffTeam)=>{
        try{
            await axios.delete(`/staff/`,{
                data : {staffStreamer, staffTeam}
            });
            loadData();
            console.log("감독/코치 삭제 실행");
        }catch (err) {
            console.error("감독/코치 삭제 실패", err);
        }
    })
    const deleteTeam = useCallback(async(teamId) =>{
        try{
            await axios.delete(`/team/${teamId}`);
            loadData();
            console.log("팀 삭제 실행");
        }catch (err) {
            console.error("팀 삭제 실패", err);
        }
    })

    //render
    return(<>
        <h2 className="text-center page-title p-3">{tournament.tournamentName} : 대회 상세</h2>
            {/* 로딩중 or 에러 */}
                {loading && (
                    <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border" role="status" />
                    </div>
                )}
            {error && <p className="text-danger">{error}</p>}
        {/* 대회 개최자 및 상세 */}
        <div className="streamer-card mb-2">

            <div className="row g-0">
                <div className="col-lg-4 col-12">
                    <h3 className="host-box text-center">주최</h3>
                    <div className="d-flex tournment-host justify-content-center align-items-center gap-2">
                    {hostList.map((host)=>(
                        <div className="text-center" key={host.hostStreamer}>
                            <Link to={`/streamer/${host.hostStreamer}`} >
                                <img className="host-profile mb-1"src={buildProfileUrl(host.streamerSoopId)}/>
                            </Link>
                            <br/><span className={`stat-box-number `}>{host.streamerName}</span>
                            {isAdmin === true && (
                                <div className="p-1 ms-1 btn btn-danger pt-0 pb-0" onClick={()=>{deleteHost(host.hostStreamer,host.hostTournament)}}>X</div>
                            )}
                        </div>
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
        {isAdmin === true && (
            <div className="col text-end">
                <Link to={`/team/insert/${tournamentId}`} className="btn btn-success">+TEAM</Link>
                <Link to={`/tournament/edit/${tournamentId}`} className="p-1 fs-5 ms-1 btn btn-warning"><FaEdit/></Link>
            </div>
        )}
        
        <div className="team-list mt-4">
        {team.map((team) => (
            <div className={`team-card
                ${team.teamRanking === "우승" ? "is-champion" : ""}
                ${team.teamRanking === "준우승" ? "is-second" : ""}
                ${team.teamRanking === "" ? "is-empty" : ""}
                `}
                key={team.teamId}>
            {/* 상단 헤더 : 순위 + 팀 이름 */}
            <div className="team-header">
                #{team.teamRanking}
                {team.teamName && <span className="team-name ms-2 p-1">{team.teamName} </span> }
                {/* 추후, 관리자만 수정가능하도록 지정 */}
                {isAdmin === true && (
                    <div className="ms-auto">
                        <Link to={`/team/edit/${team.teamId}`} className="p-1 fs-5 ms-1 btn btn-warning"><FaEdit/></Link>
                        <button className="p-1 ms-1 fs-5 btn btn-danger" onClick={() => deleteTeam(team.teamId)}><MdDelete/></button>
                    </div>
                )}
            </div>
            {/* 감독 표시 */}
            {team.staffId !== null && (
            <div className="team-header">
                <span className="badge bg-dark"> 감독 </span>
                <Link to={`/streamer/${team.staffStreamer}`} className="ms-1 btn btn-link" rel="noopener noreferrer">
                    <img className="player-profile"src={buildProfileUrl(team.staffId)} alt={team.staffName}/>
                    <span className="player-name ms-2">{team.staffName}</span>
                </Link>
                {isAdmin === true && (
                <button type="button" className="col-1 btn btn-danger p-0" onClick={()=>{deleteStaff(team.staffStreamer,team.teamId)}}>X</button>
                )}
            </div>
            )}


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