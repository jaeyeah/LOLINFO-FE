import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, Outlet } from "react-router-dom"
import "./Streamer.css";
import { buildProfileUrl } from "../../utils/profileUrl";
import { FaEdit, FaHome, FaTrophy } from "react-icons/fa";
import { MdLooksTwo } from "react-icons/md";
import { useAtomValue } from "jotai";
import { adminState } from "../../utils/jotai";

export default function StreamerDetail() {

    const isAdmin = useAtomValue(adminState);

    
    const {streamerId} = useParams();
    const [streamer, setStreamer] = useState({});
    const [streamerTeam, setStreamerTeam] = useState([]);
    const [host, setHost] = useState([]);
    const [staff, setStaff] = useState([]);
    //로딩중 설정
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadData = useCallback( async() => {
        try {
            setLoading(true);
            setError(null);
            const {data} = await axios.get(`/streamer/${streamerId}`);
            setStreamer(data);
            const teamData = await axios.get(`/team/streamer/${streamerId}`);
            setStreamerTeam(teamData.data);
            const hostData = await axios.get(`/host/streamer/${streamerId}`);
            setHost(hostData.data);
            const staffData = await axios.get(`/staff/streamer/${streamerId}`);
            setStaff(staffData.data);
        } catch (error) {
            console.error("Error fetching streamer detail:", error);
        }
        finally {
          setLoading(false);
        }
    }, [streamerId]);


    useEffect(()=>{
        loadData();
    },[streamerId, loadData]);


    const sections = [
    {
        key: "official",
        title: "공식전 기록",
        stats: [
        { label: "우승", value: streamer.officialRanking1 },
        { label: "준우승", value: streamer.officialRanking2 },
        { label: "4강", value: streamer.officialRanking3 },
        ],
        filter: (team) => team.tournamentIsOfficial === "Y",
    },
    {
        key: "total",
        title: "전체 기록",
        stats: [
        { label: "우승", value: streamer.totalRanking1 },
        { label: "준우승", value: streamer.totalRanking2 },
        { label: "4강", value: streamer.totalRanking3 },
        ],
        filter: () => true, // 전체
    },
    ];

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



    //render
    return (<>
    
    <div className="row">
        <div className="col text-center">
            <h2 className="page-title p-3">{streamer.streamerName} : 상세</h2>
        </div>
    </div>
    {/* 로딩중 or 에러 */}
    {loading && (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border" role="status" />
        </div>
    )}
    {error && <p className="text-danger">{error}</p>}
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
                <Link to={streamer.streamerStation} target="_blank" rel="noreferrer"
                    className="btn btn-station mb-2"><FaHome className="fs-2"/> </Link>
                {isAdmin === true && (
                     <Link to={`/streamer/edit/${streamerId}`} rel="noreferrer"
                    className="btn btn-station mb-2 ms-1 bg-warning"><FaEdit className="fs-2"/> </Link>
                )}
            </div>
          </div>
          <hr />

            {/* 스트리머가 개최한 대회 */}
            
            <div className="row p-2">
                {host.length > 0 && (
                <div className="col-xl-6 mt-2">
                    <div className="mb-2">
                        <span className="detail-section-title">개최대회</span>
                    </div>
                    <div className="stat-box">
                    {host.map((host)=>(
                        <div className="row mt-2 text-center text-light align-items-center" key={host.hostTournament}>
                            <div className={`col-2 fw-600 ${host.tournamentYear % 2 === 0 ? "text-secondary" : ""}`}>{host.tournamentYear}</div>
                            <div className={`col-2 badge fs-6
                                        ${host.tournamentTierType === "천상계" ? "top-tier text-dark"
                                        : host.tournamentTierType === "지상계" ? "bottom-tier"
                                        : "all-tier"
                                        }`}>{host.tournamentTierType}</div>
                            <div className="col-8">
                                <Link to={`/tournament/${host.hostTournament}`} className="streamer-link tournament-title text-warning">
                                    {host.tournamentName}
                                </Link>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}

            {/* 감독/코치로 참여한 대회 */}
                {staff.length > 0 && (
                <div className="col-xl-6 mt-2">
                <div className="mb-2">
                    <span className="detail-section-title">감독/코치</span>
                </div>
                <div className="stat-box">
                {staff.map((staff)=>(
                    <div className="row mt-2 text-center text-light align-items-center" key={staff.staffTeam}>
                        <div className={`col-2 fw-600 ${staff.tournamentYear % 2 === 0 ? "text-secondary" : ""}`}>{staff.tournamentYear}</div>
                        <span className={`col-2 text-center fs-6 ${staff.staffRole === '감독' ? "badge bg-white text-dark"
                                : "badge bg-secondary"
                            }`}>{staff.staffRole}</span>
                        <div className="col-2">{staff.tournamentName}</div>
                        <div className="col-3 fw-600">{staff.teamName}</div>
                        <span className={`col-2 text-center ${staff.teamRanking === '우승' ? "badge bg-warning text-dark"
                                : staff.teamRanking === "준우승" ? "badge bg-secondary" 
                                : staff.teamRanking === "4강" ? "badge text-light"
                                : "badge text-secondary"
                            }`}>{staff.teamRanking}</span>
                        {isAdmin === true && (
                            <button type="button" className="col-1 btn btn-danger p-0" onClick={()=>{deleteStaff(staff.staffStreamer,staff.staffTeam)}}>X</button>
                        )}
                    </div>
                ))}
                </div>
                </div>
                )}
            </div>



            {/* 하단: 공식 / 전체 기록 */}
            <div className="row g-3 mt-2">
                {sections.map((section) => {
                const filteredTeams = streamerTeam.filter(section.filter);

                return (
                <div className="col-md-6" key={section.key}>
                    <div className="mb-2">
                    <span className="detail-section-title">{section.title}</span>
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

                    <hr className="text-white mt-2 mb-2"/>

                    <div className="row">
                        {filteredTeams.map((team) => (
                        <div className="mt-1 text-white d-flex align-items-center" key={team.teamId}>
                            <div className={`col-10 fs-5 ${team.teamRanking !== '우승' ? "text-secondary" : ""}`}>
                                <span>{team.tournamentYear} | </span>
                                <span> {team.tournamentName}</span>
                            </div>
                            <span className={`col-2 text-center ${team.teamRanking === '우승' ? "badge bg-warning text-dark"
                                    : team.teamRanking === "준우승" ? "badge bg-secondary" 
                                    : team.teamRanking === "4강" ? "badge text-light"
                                    : "badge text-secondary"
                                }`}>{team.teamRanking}</span>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>


    {streamer.streamerName !== "SLL" && streamer.streamerName !== "멸망전" && (
        <>
          {/* 참여 대회 탭 네비게이션 */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex gap-2 mb-3">
                <Link to={`/streamer/${streamerId}`} className="btn btn-outline-primary">
                  기본정보
                </Link>
                <Link to={`/streamer/${streamerId}/tournaments`} className="btn btn-outline-primary">
                  참여대회
                </Link>
              </div>
            </div>
          </div>
          {/* 중첩 라우트 렌더링 */}
          <Outlet context={{ streamerTeam, streamer }} />
        </>
    )}
   




    </>)

}