import axios from "../../utils/axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useAtomValue } from "jotai";
import { adminState, loginIdState, loginState } from "../../utils/jotai";
import "./Tournament.css";
import "./Scrim.css";

export default function TournamentDetail(){

    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);
    const loginId = useAtomValue(loginIdState);

    const {tournamentId} = useParams();
    const [tournament, setTournament] = useState({});
    const [team, setTeam] = useState([]);
    const [hostList, setHostList] = useState([]);
    const [scrimList, setScrimList] = useState([]);
    const [scrimRecordList, setScrimRecordList] = useState([]);
    const [showScrimModal, setShowScrimModal] = useState(false);
    const [scrimError, setScrimError] = useState(null);
    const [scrimRecordError, setScrimRecordError] = useState(null);
    const [selectedScrimTeam, setSelectedScrimTeam] = useState(null);
    const [vsRecordList, setVsRecordList] = useState([]);
    const [vsRecordLoading, setVsRecordLoading] = useState(false);
    const [scrimForm, setScrimForm] = useState({
        scrimTournament: Number(tournamentId),
        scrimRedTeam: "",
        scrimBlueTeam: "",
        scrimRedScore: 0,
        scrimBlueScore: 0,
        scrimDate: new Date().toISOString().split("T")[0],
        scrimHour: 0,
        scrimMatchType: "",
    });
    const [showVsRecordModal, setShowVsRecordModal] = useState(false);

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

    const loadScrimList = useCallback( async() => {
        try {
            setScrimError(null);
            const {data} = await axios.get(`/scrim/${tournamentId}`);
            setScrimList(data);
        } catch (error) {
            console.error("스크림 목록 로딩 오류", error);
            setScrimError("스크림 목록을 불러오지 못했습니다.");
        }
    }, [tournamentId]);

    const loadScrimRecordList = useCallback( async() => {
        try {
            setScrimRecordError(null);
            const {data} = await axios.get(`/scrim/record/${tournamentId}`);
            //console.log("팀별 스크림 승률 데이터:", data);
            setScrimRecordList(data);
        } catch (error) {
            console.error("팀별 스크림 승률 로딩 오류", error);
            setScrimRecordError("팀별 스크림 승률을 불러오지 못했습니다.");
        }
    }, [tournamentId]);

    useEffect(()=>{
        if (!tournamentId) return;
        loadData();
        loadTeamData();
        loadHostData();
    },[loadData, loadTeamData, loadHostData]);

    useEffect(()=>{
        if (!tournamentId) return;
        loadScrimList();
        loadScrimRecordList();
    },[tournamentId]);

    // 삭제 - 개최자
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
    // 삭제 - 스태프(감독,코치)
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
    // 삭제 - 팀
    const deleteTeam = useCallback(async(teamId) =>{
        try{
            await axios.delete(`/team/${teamId}`);
            loadData();
            console.log("팀 삭제 실행");
        }catch (err) {
            console.error("팀 삭제 실패", err);
        }
    })

    const openScrimModal = useCallback(() => {
        if (!isLogin) return;

        setScrimForm({
            scrimTournament: Number(tournamentId),
            scrimRedTeam: "",
            scrimBlueTeam: "",
            scrimRedScore: 0,
            scrimBlueScore: 0,
            scrimDate: new Date().toISOString().split("T")[0],
        });
        setShowScrimModal(true);
    }, [isLogin, tournamentId]);

    const closeScrimModal = useCallback(() => {
        setShowScrimModal(false);
    }, []);

    const openVsRecordModal = async (team) => {
        try {
            setSelectedScrimTeam(team);
            setVsRecordList([]);
            setVsRecordLoading(true);
            setShowVsRecordModal(true);

            const resp = await axios.get(`/scrim/${tournamentId}/${team.teamId}`);
            setVsRecordList(resp.data);
            //console.log("상대전적 데이터:", resp.data);
        } catch (e) {
            console.error("상대전적 조회 실패", e);
            alert("상대전적 조회에 실패했습니다.");
        } finally {
            setVsRecordLoading(false);
        }
    };

    const handleScrimFormChange = (event) => {
        const { name, value } = event.target;
        setScrimForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 스크림 등록 저장
    const submitScrim = async () => {
        if (!isLogin) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!scrimForm.scrimRedTeam || !scrimForm.scrimBlueTeam) {
            alert("레드팀과 블루팀을 선택해주세요.");
            return;
        }

        if (Number(scrimForm.scrimRedTeam) === Number(scrimForm.scrimBlueTeam)) {
            alert("같은 팀끼리는 등록할 수 없습니다.");
            return;
        }

        if (Number(scrimForm.scrimRedScore) < 0 || Number(scrimForm.scrimBlueScore) < 0) {
            alert("점수는 0 이상의 숫자여야 합니다.");
            return;
        }

        try {
            await axios.post(`/scrim/`, {
                scrimTournament: Number(scrimForm.scrimTournament),
                scrimRedTeam: Number(scrimForm.scrimRedTeam),
                scrimBlueTeam: Number(scrimForm.scrimBlueTeam),
                scrimRedScore: Number(scrimForm.scrimRedScore),
                scrimBlueScore: Number(scrimForm.scrimBlueScore),
                scrimDate: scrimForm.scrimDate,
                scrimHour: Number(scrimForm.scrimHour),
                scrimMatchType: scrimForm.scrimMatchType,
            });

            alert("스크림 전적이 등록되었습니다.");
            closeScrimModal();
            setScrimForm({
                scrimTournament: Number(tournamentId),
                scrimRedTeam: "",
                scrimBlueTeam: "",
                scrimRedScore: 0,
                scrimBlueScore: 0,
                scrimDate: new Date().toISOString().split("T")[0],
            });
            await loadScrimList();
            await loadScrimRecordList();
            loadTeamData();
            loadData();
        } catch (error) {
            console.error("스크림 등록 실패", error);
            alert("스크림 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // 스크림 수정
    // 수정을 위한 useState
    const [editScrimId, setEditScrimId] = useState(null);
    const [editScrimForm, setEditScrimForm] = useState({
        scrimDate: new Date().toISOString().split("T")[0],
        scrimRedScore: 0,
        scrimBlueScore: 0,
        scrimHour: 0,
    });
    const startEditScrim = useCallback((scrim) => {
        setEditScrimId(scrim.scrimId);

        setEditScrimForm({
            scrimId: scrim.scrimId,
            scrimDate: String(scrim.scrimDate).slice(0, 10),
            scrimHour: scrim.scrimHour ?? "",
            scrimRedScore: scrim.scrimRedScore ?? 0,
            scrimBlueScore: scrim.scrimBlueScore ?? 0,
            scrimMatchType: scrim.scrimMatchType ?? "스크림",
        });
    }, []);
    // 스크림 수정 저장
    const updateScrim = async () => {
        try {
            await axios.patch("/scrim/", {
                scrimId: editScrimId,
                scrimDate: editScrimForm.scrimDate,
                scrimRedScore: Number(editScrimForm.scrimRedScore),
                scrimBlueScore: Number(editScrimForm.scrimBlueScore),
                scrimHour: Number(editScrimForm.scrimHour),
            });

            setEditScrimId(null);
            loadScrimList();
            loadScrimRecordList();
        } catch (error) {
            console.error("스크림 수정 실패", error);
            alert("스크림 수정 중 오류가 발생했습니다.");
        }
    };

    // 스크림 삭제
    const deleteScrim = async (scrimId) => {
        if (!window.confirm("정말로 이 스크림 전적을 삭제하시겠습니까?")) {
            return;
        }
        try {
            await axios.delete(`/scrim/${scrimId}`);
            loadScrimList();
            loadScrimRecordList();
        } catch (error) {
            console.error("스크림 삭제 실패", error);
            alert("스크림 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    //render -------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------
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

        {/* 스크림 등록 / 팀 추가 / 대회정보 수정 */}
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
            <div>
                {isLogin ? ( // 스크림 등록 버튼 활성화 여부
                    <button type="button" className="btn btn-primary" onClick={openScrimModal}>
                        스크림 등록
                    </button>
                ) : (
                    <button type="button" className="btn btn-primary" disabled>
                        스크림 등록
                    </button>
                )}
                {!isLogin && (<span className="text-secondary ms-2 small mt-2"> 로그인 후 스크림 전적을 등록할 수 있습니다. </span>)}
            </div>
            {isAdmin === true && (
                <div className="text-end">
                    <Link to={`/team/insert/${tournamentId}`} className="btn btn-success me-1">+TEAM</Link>
                    <Link to={`/tournament/edit/${tournamentId}`} className="p-1 fs-5 btn btn-warning"><FaEdit/></Link>
                </div>
            )}
        </div>

        {/* 스크림 정보 및 팀 목록 */}
        <div className="row g-3">
            {/* 하단 왼쪽----------------------------------------------------------------------------------------------------------*/}
            {/* 왼쪽: 팀별 스크림 승률 및 전체 스크림 목록 */}
            <div className="col-lg-4 col-12">
                {/* 팀별 스크림 승률 */}
                <div className="mb-4">
                    <h4 className="mb-3 detail-section-title">팀별 스크림 승률</h4>
                    {scrimRecordError && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {scrimRecordError}
                        </div>
                    )}
                    <div className="card bg-dark border-secondary text-white">
                        {scrimRecordList.length === 0 ? (
                            <div className="card-body text-center">
                                등록된 스크림 전적이 없습니다.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-striped mb-0 align-middle">
                                    <thead className="text-center table-secondary text-dark">
                                        <tr>
                                            <th style={{ width: "40%" }}>팀명</th>
                                            <th style={{ width: "30%" }}>세트 전적</th>
                                            <th style={{ width: "30%" }}>승률</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scrimRecordList.map(record => (
                                            <tr key={`${record.scrimTournament}-${record.scrimTeam}`} className="border-secondary text-center">
                                                <td>{record.teamName}</td>
                                                <td className="text-center">{record.scrimWinCount}승 {record.scrimLoseCount}패 
                                                </td>
                                                <td>
                                                    <div className="progress position-relative" style={{ height: "24px", width: "100%" }}>
                                                        <div  className={`progress-bar ${ record.scrimWinRate <= 40 ? "bg-danger"
                                                            : record.scrimWinRate < 50 ? "bg-warning"
                                                            : record.scrimWinRate < 60 ? "bg-secondary" : "bg-primary" }`} style={{ width: `${record.scrimWinRate}%` }} />
                                                        <span className="position-absolute top-50 end-0 translate-middle-y pe-2 fw-bold text-dark fs-6" style={{ zIndex: 1 }}> {record.scrimWinRate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* 전체 스크림 목록 */}
                <div>
                    <h4 className="mb-3 detail-section-title">전체 스크림 목록</h4>
                    {scrimError && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {scrimError}
                        </div>
                    )}
                    <div className="card bg-dark border-secondary text-white">
                        {scrimList.length === 0 ? (
                            <div className="card-body text-center">
                                등록된 스크림 기록이 없습니다.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-striped mb-0 align-middle">
                                    <thead className="text-center table-secondary text-dark">
                                        <tr>
                                            <th style={{ width: "10%" }}>날짜</th>
                                            <th style={{ width: "10%" }}>시간</th>
                                            <th style={{ width: "50%" }}>대전 결과</th>
                                            {isAdmin && <th>관리</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scrimList.map(scrim => {
                                            const redWon = scrim.scrimWinner === scrim.scrimRedTeam;
                                            const blueWon = scrim.scrimWinner === scrim.scrimBlueTeam;
                                            return (
                                                <tr key={scrim.scrimId} className={`border-secondary text-center
                                                        ${scrim.scrimMatchType == "공식" ? "match-official"
                                                        : scrim.scrimMatchType == "4강" ? "match-semifinal"
                                                        : scrim.scrimMatchType == "결승" ? "match-final" : ""} `}>
                                                    {editScrimId === scrim.scrimId ? (
                                                        // 스크림 수정 모드
                                                        <>
                                                            <td>
                                                                <input type="date" className="form-control form-control-sm" value={editScrimForm.scrimDate}
                                                                    onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimDate: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input type="number" min="0" max="24" className="form-control form-control-sm" value={editScrimForm.scrimHour}
                                                                    onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimHour: e.target.value }))}
                                                                />
                                                            </td>

                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                                                    <span className="text-secondary">{scrim.scrimRedName}</span>
                                                                    <input type="number" min="0" max="5" style={{ width: "60px" }} className="form-control form-control-sm" value={editScrimForm.scrimRedScore}
                                                                        onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimRedScore: e.target.value }))}
                                                                    />
                                                                    <span>:</span>
                                                                    <input type="number" min="0" max="5" style={{ width: "60px" }} className="form-control form-control-sm" value={editScrimForm.scrimBlueScore}
                                                                        onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimBlueScore: e.target.value }))}
                                                                    />
                                                                    <span className="text-secondary">{scrim.scrimBlueName}</span>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="d-flex gap-2 justify-content-center">
                                                                    <button className="btn btn-sm btn-success" onClick={updateScrim}>
                                                                        저장
                                                                    </button>
                                                                    <button className="btn btn-sm btn-secondary" onClick={() => {setEditScrimId(null); }}>
                                                                        취소
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        // 일반 모드 
                                                        <>    
                                                            <td>
                                                                {new Date(scrim.scrimDate).toLocaleDateString("ko-KR",{
                                                                    month : "2-digit", day : "2-digit",
                                                                })}
                                                            </td>
                                                            <td>
                                                                {scrim.scrimMatchType == "스크림" ? (
                                                                    <span>{scrim.scrimHour}시</span>
                                                                ) : (
                                                                    <span className={`badge ${scrim.scrimMatchType === '공식' ? 'bg-white text-dark' : 'bg-primary'}`}>
                                                                        {scrim.scrimMatchType}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        <span className={`badge ${redWon ? 'bg-success' : blueWon ? 'bg-danger' : 'bg-secondary'}`}>
                                                                            {redWon ? '승' : blueWon ? '패' : '무'}
                                                                        </span>
                                                                        <span>{scrim.scrimRedName}</span>
                                                                    </div>
                                                                    <span className="mx-2 fw-bold" style={{ color: "#ffc107" }}>{scrim.scrimRedScore}:{scrim.scrimBlueScore}</span>
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        <span>{scrim.scrimBlueName}</span>
                                                                        <span className={`badge ${blueWon ? 'bg-success' : redWon ? 'bg-danger' : 'bg-secondary'}`}>
                                                                            {blueWon ? '승' : redWon ? '패' : '무'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {(isAdmin || scrim.scrimCreatedBy === loginId) ? (
                                                                <td>
                                                                    <button className="btn btn-sm btn-warning" onClick={() => startEditScrim(scrim)}>수정</button>
                                                                    <button className="btn btn-sm btn-danger" onClick={() => deleteScrim(scrim.scrimId)}>삭제</button>
                                                                </td>
                                                                ):( <></>
                                                            )}
                                                    </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 하단 오른쪽----------------------------------------------------------------------------------------------------------*/}
            {/* 오른쪽: 기존 팀 목록 */}
            <div className="col-lg-8 col-12">
                <h4 className="mb-3 detail-section-title">Team</h4>
                <div className="team-list">
        {team.map((team) => (
            <div className={`team-card
                ${team.teamRanking === "우승" ? "is-champion" : ""}
                ${team.teamRanking === "준우승" ? "is-second" : ""}
                ${team.teamRanking === "예선탈락" ? "is-failed" : ""}
                ${team.teamRanking === "임시" ? "is-empty" : ""}
                `} key={team.teamId}>
                {/* 상단 헤더 : 순위 + 팀 이름 */}
                <div className="team-header">
                    #{team.teamRanking}
                    {team.teamName && <span className="team-name ms-2 p-1">{team.teamName} </span> }
                    {/* 추후, 관리자만 수정가능하도록 지정 */}
                    <div className="ms-auto d-flex gap-2 align-items-center">
                        <button type="button" className="ms-1 btn btn-sm btn-outline-dark"
                            onClick={() => openVsRecordModal(team)}>
                            상세전적
                        </button>
                        {isAdmin === true && (
                            <>
                                <Link to={`/team/edit/${team.teamId}`} className="p-1 fs-5 ms-1 btn btn-warning"><FaEdit/></Link>
                                <button className="p-1 ms-1 fs-5 btn btn-danger" onClick={() => deleteTeam(team.teamId)}><MdDelete/></button>
                            </>
                        )}
                    </div>
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
        ))}</div>
            </div>
        </div>





        {/* 모달 부분 */}
        {/* 스크림 등록 모달*/}
        {showScrimModal && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content insert-form p-0">
                        <div className="modal-header">
                            <h5 className="modal-title text-white">스크림 등록</h5>
                            <button type="button" className="btn-close" onClick={closeScrimModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">레드팀</label>
                                <div className="col-sm-9">
                                    <select id="scrimRedTeam" name="scrimRedTeam" className="form-select" value={scrimForm.scrimRedTeam} onChange={handleScrimFormChange}>
                                        <option value=""> ▼ 팀 선택</option>
                                        <option value="">----------</option>
                                        {team.map((teamItem) => (
                                            <option key={teamItem.teamId} value={teamItem.teamId} >
                                                {teamItem.teamName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">블루팀</label>
                                <div className="col-sm-9">
                                    <select id="scrimBlueTeam" name="scrimBlueTeam" className="form-select" value={scrimForm.scrimBlueTeam} onChange={handleScrimFormChange}>
                                        <option value=""> ▼ 팀 선택</option>
                                        <option value="">----------</option>
                                        {team.map((teamItem) => (
                                            <option key={teamItem.teamId} value={teamItem.teamId}>
                                                {teamItem.teamName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">레드팀 승리</label>
                                <div className="col-sm-9">
                                    <input id="scrimRedScore" name="scrimRedScore" type="number" min="0" className="form-control" value={scrimForm.scrimRedScore} onChange={handleScrimFormChange} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">블루팀 승리</label>
                                <div className="col-sm-9">
                                    <input id="scrimBlueScore" name="scrimBlueScore" type="number" min="0" className="form-control" value={scrimForm.scrimBlueScore} onChange={handleScrimFormChange} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">스크림 날짜</label>
                                <div className="col-sm-9">
                                    <input id="scrimDate" name="scrimDate" type="date" className="form-control" value={scrimForm.scrimDate} onChange={handleScrimFormChange} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">스크림 시간</label>
                                <div className="col-sm-9">
                                    <input id="scrimHour" name="scrimHour" type="number" min="0" max="24" className="form-control" value={scrimForm.scrimHour} onChange={handleScrimFormChange} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label text-white">매치 타입</label>
                                <div className="col-sm-9">
                                    <select id="scrimMatchType" name="scrimMatchType" className="form-select" value={scrimForm.scrimMatchType} onChange={handleScrimFormChange}>
                                        <option value="스크림">스크림</option>
                                        <option value="공식">공식</option>
                                        {isAdmin && (<>
                                            <option value="4강">4강</option>
                                            <option value="결승">결승</option>
                                            </>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <button type="button" className="btn btn-secondary" onClick={closeScrimModal}>취소</button>
                            <button type="button" className="btn btn-lg btn-insert" onClick={submitScrim}>등록</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* 팀별 스크림 상대전적 모달 */}
        {showVsRecordModal && (
        <div className="modal fade show d-block" id="vsRecordModal" 
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-dark text-light border-secondary">
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title">
                            {selectedScrimTeam?.teamName} 스크림 상대전적
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={() => setShowVsRecordModal(false)}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {vsRecordLoading ? (
                            <div className="text-center text-secondary py-3">
                                상대전적을 불러오는 중입니다...
                            </div>
                        ) : vsRecordList.length === 0 ? (
                            <div className="text-center text-secondary py-3">
                                등록된 상대전적이 없습니다.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-sm table-striped text-center align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>상대팀</th>
                                            <th>세트 전적</th>
                                            <th>승률</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vsRecordList.map(record => (
                                            <tr key={record.vsTeam}>
                                                <td>{record.vsTeamName}</td>
                                                <td>{record.vsWinCount}승 {record.vsLoseCount}패</td>
                                                <td>{record.vsWinRate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {/* <div className="modal-footer border-secondary">
                    </div> */}
                </div>
            </div>
        </div>
        )}


</>)}