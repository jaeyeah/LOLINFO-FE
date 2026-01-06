import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import "./Streamer.css";
import { buildProfileUrl } from "../../utils/profileUrl";
import { FaHome, FaTrophy } from "react-icons/fa";
import { MdLooksTwo } from "react-icons/md";

export default function StreamerDetail() {

    const {streamerId} = useParams();
    const [streamer, setStreamer] = useState({});
    const [streamerTeam, setStreamerTeam] = useState([]);

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/streamer/${streamerId}`);
            setStreamer(data);
            console.log(data);
            const teamData = await axios.get(`/team/streamer/${streamerId}`);
            console.log(teamData.data);
            setStreamerTeam(teamData.data);
        } catch (error) {
            console.error("Error fetching streamer detail:", error);
        }
    }, [streamerId]);


    useEffect(()=>{
        loadData();
    },[streamerId]);

    //render
    return (<>
    
    <div className="row">
        <div className="col text-center">
            <h2 className="page-title p-3">{streamer.streamerName} : 개인 상세</h2>
        </div>
    </div>
    {/* 스트리머 상세 */}
    <div className="streamer-wrapper">
      <div className="card streamer-card mb-4">
        <div className="card-body">
          {/* 상단: 프로필 + 이름 + 버튼들 */}
          <div className="row align-items-center">
            <div className="col-auto">
              <img src={streamer.streamerProfile} className="streamer-profile"/>
            </div>
            <div className="col">
              <h3 className="card-title mb-1">{streamer.streamerName}</h3>
              <p className="card-text mb-0">@{streamer.streamerSoopId}</p>
            </div>
            <div className="col-auto text-end">
                <a href={streamer.streamerStation} target="_blank" rel="noreferrer"
                    className="btn btn-station mb-2"><FaHome className="fs-2"/> </a>
            </div>
          </div>
          <hr />

            {/* 하단: 공식 / 전체 기록 */}
            <div className="row g-3 mt-2">
            {[
                {
                title: "공식전 기록", stats: [
                    { label: "우승", value: streamer.officialRanking1 },
                    { label: "준우승", value: streamer.officialRanking2 },
                    { label: "4강", value: streamer.officialRanking3 },
                ],},
                {
                title: "전체 기록", stats: [
                    { label: "우승", value: streamer.totalRanking1 },
                    { label: "준우승", value: streamer.totalRanking2 },
                    { label: "4강", value: streamer.totalRanking3 },
                ],},
            ].map((section) => (
                <div className="col-md-6" key={section.title}>
                <div className="mb-2">
                    <span className="detail-section-title">
                    {section.title}
                    </span>
                </div>

                <div className="stat-box">
                    <div className="row text-center">
                        {section.stats.map((stat) => (
                        <div className="col" key={stat.label}>
                            <div className="stat-box-label">{stat.label}</div>
                            <div className="stat-box-number">
                            {stat.value}
                            <span className="stat-box-unit"> 회</span>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
            ))}
            </div>

        </div>
      </div>
    </div>



    {/* 참여 대회 상세 */}
    <div className="row mt-0">
        {/* 공식 대회 */}
        <div className="col-lg-6 col-12 mb-2">
            <span className="section-title-isofficial text-center mt-2"> 공식 </span>
            {streamerTeam.filter(team => team.tournamentIsOfficial === "Y").map((team)=>(
                <div className={`card team-card mb-3 mt-2
                        ${team.teamRanking === "우승" ? "is-champion" : ""}
                        ${team.teamRanking === "준우승" ? "is-second" : ""}`} key={team.teamId}>
                    <div className ="row">
                        {/* 대회연도와 배지형 타입구분 */}
                        <div className="col-3">
                            <span className={`streamer-year-tag mb-2 ${team.tournamentYear % 2 === 0 ? "even" : "odd"}`}>{team.tournamentYear}</span>
                            <span className={`tier-text ms-2 badge ${team.tournamentTierType === "통합" ? "all-tier" : team.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier" }`}> {team.tournamentTierType}</span>
                            {team.tournamentName?.includes("멸망전") && (
                                <span className="badge official-badge2 ms-2">멸망전</span> )}
                            {team.tournamentIsOfficial === "Y" && (
                                <span className="badge official-badge ms-2">공식</span> )}
                        </div>
                        <div className="col-9">
                            <div className="row">
                                <div className="col-9 tournament-row">
                                    <Link to={`/tournament/${team.tournamentId}`} className="tournament-title">{team.tournamentName}</Link>
                                    {team.teamName && <span className="team-name">{team.teamName} </span>}  
                                </div>
                                <div className="col-3 text-end">
                                    {team.teamRanking === "우승" ? (
                                        <FaTrophy className="fs-3 text-warning"/>
                                    )
                                    : team.teamRanking === "준우승" ? (
                                        <MdLooksTwo className="fs-2 text-light"/>
                                    ) : (
                                        <span className="team-ranking">{team.teamRanking}</span>
                                    )}
                                </div>
                            </div>
                            {/* 팀원 정보 */}
                            <div className="row card team-card mt-2">
                                <div className="col-12 period-box-body team-member">
                                    <Link to={`/streamer/${team.teamTop}`} className="streamer-link">
                                    <div className="player">
                                        <img className="player-profile mb-1"src={buildProfileUrl(team.topId)} alt={team.topName}/>
                                        <br/><span className={`player-name ${team.topName === streamer.streamerName ? "highlighted" : ""}`}>{team.topName}</span>
                                    </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamJug}`} className="streamer-link">
                                    <div className="player">
                                        <img className="player-profile mb-1"src={buildProfileUrl(team.jugId)} alt={team.jugName}/>
                                        <br/><span className={`player-name ${team.jugName === streamer.streamerName ? "highlighted" : ""}`}>{team.jugName}</span>
                                    </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamMid}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.midId)} alt={team.midName}/>
                                            <br/><span className={`player-name ${team.midName === streamer.streamerName ? "highlighted" : ""}`}>{team.midName}</span>
                                        </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamAd}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.adId)} alt={team.adName}/>
                                            <br/><span className={`player-name ${team.adName === streamer.streamerName ? "highlighted" : ""}`}>{team.adName}</span>
                                        </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamSup}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.supId)} alt={team.supName}/>
                                            <br/><span className={`player-name ${team.supName === streamer.streamerName ? "highlighted" : ""}`}>{team.supName}</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* 스트리머 개최대회 */}
        <div className="col-lg-6 col-12">
            <span className="section-title-isofficial text-center mt-2"> 스트리머 개최 </span>
            {streamerTeam.filter(team => team.tournamentIsOfficial === "N").map((team)=>(
                <div className={`card team-card mb-3 mt-2
                        ${team.teamRanking === "우승" ? "is-champion" : ""}
                        ${team.teamRanking === "준우승" ? "is-second" : ""}`} key={team.teamId}>
                    <div className ="row">
                        {/* 대회연도와 배지형 타입구분 */}
                        <div className="col-3">
                            <span className={`streamer-year-tag mb-2 ${team.tournamentYear % 2 === 0 ? "even" : "odd"}`}>{team.tournamentYear}</span>
                            <span className={`tier-text ms-2 badge ${team.tournamentTierType === "통합" ? "all-tier" : team.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier" }`}> {team.tournamentTierType}</span>
                            {team.tournamentName?.includes("멸망전") && (
                                <span className="badge official-badge2 ms-2">멸망전</span> )}
                            {team.tournamentIsOfficial === "Y" && (
                                <span className="badge official-badge ms-2">공식</span> )}
                        </div>
                        <div className="col-9">
                            <div className="row">
                                <div className="col-8 tournament-row">
                                    <Link to={`/tournament/${team.tournamentId}`} className="tournament-title">{team.tournamentName}</Link>
                                    <span> </span>
                                    {team.teamName && <span className="team-name">{team.teamName}</span>}  
                                </div>
                                <div className="col-3 text-end ms-4">
                                    {team.teamRanking === "우승" ? (
                                        <FaTrophy className="fs-3 text-warning"/>
                                    )
                                    : team.teamRanking === "준우승" ? (
                                        <MdLooksTwo className="fs-2 text-light"/>
                                    ) : (
                                        <span className="team-ranking">{team.teamRanking}</span>
                                    )}
                                </div>
                            </div>
                            {/* 팀원 정보 */}
                            <div className="card team-card mt-2">
                                <div className="period-box-body team-member">
                                    <Link to={`/streamer/${team.teamTop}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.topId)} alt={team.topName}/>
                                            <br/><span className={`player-name ${team.topName === streamer.streamerName ? "highlighted" : ""}`}>{team.topName}</span>
                                        </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamJug}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.jugId)} alt={team.jugName}/>
                                            <br/><span className={`player-name ${team.jugName === streamer.streamerName ? "highlighted" : ""}`}>{team.jugName}</span>
                                        </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamMid}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.midId)} alt={team.midName}/>
                                            <br/><span className={`player-name ${team.midName === streamer.streamerName ? "highlighted" : ""}`}>{team.midName}</span>
                                        </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamAd}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.adId)} alt={team.adName}/>
                                            <br/><span className={`player-name ${team.adName === streamer.streamerName ? "highlighted" : ""}`}>{team.adName}</span>
                                        </div>
                                    </Link>
                                    <Link to={`/streamer/${team.teamSup}`} className="streamer-link">
                                        <div className="player">
                                            <img className="player-profile mb-1"src={buildProfileUrl(team.supId)} alt={team.supName}/>
                                            <br/><span className={`player-name ${team.supName === streamer.streamerName ? "highlighted" : ""}`}>{team.supName}</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>




    </>)

}