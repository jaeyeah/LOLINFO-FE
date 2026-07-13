import axios from "../../utils/axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import TeamStaffModal from "./TeamStaffModal";
import ScrimList from "./ScrimList";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "./Tournament.css";
import "./Scrim.css";

const createInitialScrimForm = (tournamentId) => ({
  scrimTournament: Number(tournamentId),
  scrimRedTeam: "",
  scrimBlueTeam: "",
  scrimRedScore: 0,
  scrimBlueScore: 0,
  scrimDate: new Date().toISOString().split("T")[0],
  scrimHour: 0,
  scrimMatchType: "스크림",
});

export default function TournamentMain() {
  const { tournament, tournamentId, isLogin, isAdmin, loginId } = useOutletContext();

  const [team, setTeam] = useState([]);
  const [scrimRecordList, setScrimRecordList] = useState([]);
  const [showScrimModal, setShowScrimModal] = useState(false);
  const [scrimRefreshKey, setScrimRefreshKey] = useState(0);
  const [scrimRecordError, setScrimRecordError] = useState(null);
  const [selectedScrimTeam, setSelectedScrimTeam] = useState(null);
  const [vsRecordList, setVsRecordList] = useState([]);
  const [vsRecordLoading, setVsRecordLoading] = useState(false);
  const [scrimForm, setScrimForm] = useState(() => createInitialScrimForm(tournamentId));
  const [showVsRecordModal, setShowVsRecordModal] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const loadTeamData = useCallback(async () => {
    if (!tournamentId) return;

    try {
      const { data } = await axios.get(`/team/tournament/${tournamentId}`);
      setTeam(data);
    } catch (err) {
      console.error("팀 로딩 오류", err);
    }
  }, [tournamentId]);

  const loadScrimRecordList = useCallback(async () => {
    if (!tournamentId) return;

    try {
      setScrimRecordError(null);
      const { data } = await axios.get(`/scrim/record/${tournamentId}`);
      setScrimRecordList(data);
    } catch (err) {
      console.error("팀별 스크림 승률 로딩 오류", err);
      setScrimRecordError("팀별 스크림 승률을 불러오지 못했습니다.");
    }
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;

    loadTeamData();
    loadScrimRecordList();
  }, [loadTeamData, loadScrimRecordList, tournamentId]);

  const openStaffModal = useCallback((teamItem) => {
    setSelectedTeam(teamItem);
    setStaffModalOpen(true);
  }, []);

  const closeStaffModal = useCallback(() => {
    setStaffModalOpen(false);
    setSelectedTeam(null);
  }, []);

  const deleteStaff = useCallback(async (staffStreamer, staffTeam) => {
    try {
      await axios.delete(`/staff/`, {
        data: { staffStreamer, staffTeam },
      });
      await loadTeamData();
    } catch (err) {
      console.error("감독/코치 삭제 실패", err);
    }
  }, [loadTeamData]);

  const deleteTeam = useCallback(async (teamId) => {
    try {
      await axios.delete(`/team/${teamId}`);
      await loadTeamData();
    } catch (err) {
      console.error("팀 삭제 실패", err);
    }
  }, [loadTeamData]);

  const openScrimModal = useCallback(() => {
    if (!isLogin) return;

    setScrimForm(createInitialScrimForm(tournamentId));
    setShowScrimModal(true);
  }, [isLogin, tournamentId]);

  const closeScrimModal = useCallback(() => {
    setShowScrimModal(false);
  }, []);

  const handleScrimFormChange = (event) => {
    const { name, value } = event.target;
    setScrimForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openVsRecordModal = async (teamItem) => {
    try {
      setSelectedScrimTeam(teamItem);
      setVsRecordList([]);
      setVsRecordLoading(true);
      setShowVsRecordModal(true);

      const { data } = await axios.get(`/scrim/${tournamentId}/${teamItem.teamId}`);
      setVsRecordList(data);
    } catch (err) {
      console.error("상대전적 조회 실패", err);
      alert("상대전적 조회에 실패했습니다.");
    } finally {
      setVsRecordLoading(false);
    }
  };

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
        scrimMatchType: scrimForm.scrimMatchType || "스크림",
      });

      alert("스크림 전적이 등록되었습니다.");
      closeScrimModal();
      setScrimForm(createInitialScrimForm(tournamentId));
      setScrimRefreshKey((prev) => prev + 1);
      await loadScrimRecordList();
      await loadTeamData();
    } catch (err) {
      console.error("스크림 등록 실패", err);
      alert("스크림 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const getWinRateColor = (rate) => {
    if (rate >= 70) return "#3bc9db";
    if (rate >= 60) return "#4dabf7";
    if (rate >= 55) return "#69db7c";
    if (rate >= 50) return "#adb5bd";
    if (rate >= 45) return "#fcc419";
    if (rate >= 40) return "#ff922b";
    return "#ff6b6b";
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
        <div>
          {isLogin ? (
            <button type="button" className="btn btn-primary" onClick={openScrimModal}>
              스크림 등록
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled>
              스크림 등록
            </button>
          )}
          {!isLogin && <span className="text-secondary ms-2 small mt-2"> 로그인 후 스크림 전적을 등록할 수 있습니다. </span>}
          {isLogin && <span className="text-secondary ms-2 small mt-2"> 점수를 0:0 으로 설정하면, 예정경기를 등록할 수 있습니다. </span>}
        </div>

        {isAdmin === true && (
          <div className="text-end">
            <Link to={`/team/insert/${tournamentId}`} className="btn btn-success me-1">
              +TEAM
            </Link>
            <Link to={`/tournament/edit/${tournamentId}`} className="p-1 fs-5 btn btn-warning">
              <FaEdit />
            </Link>
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-lg-4 col-12">
          <div className="mb-4">
            <h4 className="mb-3 detail-section-title">팀별 스크림 승률</h4>
            {scrimRecordError && (
              <div className="alert alert-danger mb-3" role="alert">
                {scrimRecordError}
              </div>
            )}
            <div className="card bg-dark border-secondary text-white">
              {scrimRecordList.length === 0 ? (
                <div className="card-body text-center">등록된 스크림 전적이 없습니다.</div>
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
                      {scrimRecordList.map((record) => (
                        <tr key={`${record.scrimTournament}-${record.scrimTeam}`} className="border-secondary text-center">
                          <td>{record.teamName}</td>
                          <td className="text-center">
                            {record.scrimWinCount}승 {record.scrimLoseCount}패
                          </td>
                          <td>
                            <div className="progress position-relative" style={{ height: "24px", width: "100%" }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${record.scrimWinRate}%`,
                                  backgroundColor: getWinRateColor(record.scrimWinRate),
                                }}
                              />
                              <span className="position-absolute top-50 end-0 translate-middle-y pe-2 fw-bold text-dark fs-6" style={{ zIndex: 1 }}>
                                {record.scrimWinRate}%
                              </span>
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

          <ScrimList
            tournamentId={tournamentId}
            isAdmin={isAdmin}
            loginId={loginId}
            onChanged={() => {
              loadScrimRecordList();
              loadTeamData();
            }}
            refreshKey={scrimRefreshKey}
          />
        </div>

        <div className="col-lg-8 col-12">
          <h4 className="mb-3 detail-section-title">Team</h4>
          <div className="team-list">
            {team.map((teamItem) => (
              <div
                className={`team-card ${teamItem.teamRanking === "우승" ? "is-champion" : ""} ${teamItem.teamRanking === "준우승" ? "is-second" : ""} ${teamItem.teamRanking === "예선탈락" ? "is-failed" : ""} ${teamItem.teamRanking === "임시" ? "is-empty" : ""}`}
                key={teamItem.teamId}
              >
                <div className="team-header">
                  #{teamItem.teamRanking}
                  {teamItem.teamName && <span className="team-name ms-2 p-1">{teamItem.teamName}</span>}
                  <div className="ms-auto d-flex gap-2 align-items-center">
                    <button type="button" className="ms-1 btn btn-sm btn-outline-dark" onClick={() => openVsRecordModal(teamItem)}>
                      상세전적
                    </button>
                    {isAdmin === true && (
                      <>
                        <Link to={`/team/edit/${teamItem.teamId}`} className="p-1 fs-5 ms-1 btn btn-warning">
                          <FaEdit />
                        </Link>
                        <button className="p-1 ms-1 fs-5 btn btn-danger" onClick={() => deleteTeam(teamItem.teamId)}>
                          <MdDelete />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {teamItem.staffId !== null && (
                  <div className="team-header">
                    <span className="badge bg-dark"> 감독 </span>
                    <Link to={`/streamer/${teamItem.staffStreamer}`} className="ms-1 btn btn-link" rel="noopener noreferrer">
                      <img className="player-profile" src={buildProfileUrl(teamItem.staffId)} alt={teamItem.staffName} />
                      <span className="player-name ms-2">{teamItem.staffName}</span>
                    </Link>
                    <div className="ms-auto">
                      <button className="btn btn-sm btn-outline-dark" onClick={() => openStaffModal(teamItem)}>
                        코치 목록
                      </button>
                      {isAdmin === true && (
                        <button type="button" className="col-1 btn btn-danger p-0" onClick={() => deleteStaff(teamItem.staffStreamer, teamItem.teamId)}>
                          X
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="player-list">
                  <div className="player-row">
                    <span className="badge"> 탑 </span>
                    <Link to={`/streamer/${teamItem.teamTop}`} className="btn btn-link" rel="noopener noreferrer">
                      <img className="player-profile" src={buildProfileUrl(teamItem.topId)} alt={teamItem.topName} />
                      <span className="player-name ms-2">{teamItem.topName}</span>
                    </Link>
                  </div>
                  <div className="player-row">
                    <span className="badge">정글</span>
                    <Link to={`/streamer/${teamItem.teamJug}`} className="btn btn-link" rel="noopener noreferrer">
                      <img className="player-profile" src={buildProfileUrl(teamItem.jugId)} alt={teamItem.jugName} />
                      <span className="player-name ms-2">{teamItem.jugName}</span>
                    </Link>
                  </div>
                  <div className="player-row">
                    <span className="badge">미드</span>
                    <Link to={`/streamer/${teamItem.teamMid}`} className="btn btn-link" rel="noopener noreferrer">
                      <img className="player-profile" src={buildProfileUrl(teamItem.midId)} alt={teamItem.midName} />
                      <span className="player-name ms-2">{teamItem.midName}</span>
                    </Link>
                  </div>
                  <div className="player-row">
                    <span className="badge">원딜</span>
                    <Link to={`/streamer/${teamItem.teamAd}`} className="btn btn-link" rel="noopener noreferrer">
                      <img className="player-profile" src={buildProfileUrl(teamItem.adId)} alt={teamItem.adName} />
                      <span className="player-name ms-2">{teamItem.adName}</span>
                    </Link>
                  </div>
                  <div className="player-row">
                    <span className="badge">서폿</span>
                    <Link to={`/streamer/${teamItem.teamSup}`} className="btn btn-link" rel="noopener noreferrer">
                      <img className="player-profile" src={buildProfileUrl(teamItem.supId)} alt={teamItem.supName} />
                      <span className="player-name ms-2">{teamItem.supName}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                        <option key={teamItem.teamId} value={teamItem.teamId}>
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
                      {isAdmin && (
                        <>
                          <option value="4강">4강</option>
                          <option value="결승">결승</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button type="button" className="btn btn-secondary" onClick={closeScrimModal}>
                  취소
                </button>
                <button type="button" className="btn btn-lg btn-insert" onClick={submitScrim}>
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVsRecordModal && (
        <div className="modal fade show d-block" id="vsRecordModal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedScrimTeam?.teamName} 스크림 상대전적</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowVsRecordModal(false)}></button>
              </div>
              <div className="modal-body">
                {vsRecordLoading ? (
                  <div className="text-center text-secondary py-3">상대전적을 불러오는 중입니다...</div>
                ) : vsRecordList.length === 0 ? (
                  <div className="text-center text-secondary py-3">등록된 상대전적이 없습니다.</div>
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
                        {vsRecordList.map((record) => (
                          <tr key={record.vsTeam}>
                            <td>{record.vsTeamName}</td>
                            <td>
                              {record.vsWinCount}승 {record.vsLoseCount}패
                            </td>
                            <td>{record.vsWinRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <TeamStaffModal show={staffModalOpen} teamId={selectedTeam?.teamId} teamName={selectedTeam?.teamName} onClose={closeStaffModal} />
    </>
  );
}
