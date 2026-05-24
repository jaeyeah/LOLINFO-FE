import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";

export default function StreamerCk() {
  const { streamerId } = useParams();
  const { streamer } = useOutletContext();
  const [ckList, setCkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCkData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/ck/streamer/${streamerId}`);
      setCkList(data);
      console.log("CK 데이터 로드 성공:", data);
    } catch (err) {
      console.error("CK 데이터 로드 실패:", err);
      setError("CK 데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [streamerId]);

  useEffect(() => {
    loadCkData();
  }, [streamerId, loadCkData]);

  // 현재 스트리머 표시
  const getStreamer = (ck) => {
    const participant = ck.participants.find(
      (p) => p.ckStreamer === Number(streamerId)
    );
    return participant ? participant.streamerName : "알 수 없음";
  }

  const myStreamerId = Number(streamerId);
  const POSITION_ORDER = ["TOP", "JUG", "MID", "AD", "SUP"];

  const getMe = (ck) => {
    return ck.participants.find((p) => p.ckStreamer === myStreamerId);
  };

  const getLaneOpponent = (ck, me) => {
    if (!me) return null;

    const opponentSide = me.ckSide === "red" ? "blue" : "red";
    return ck.participants.find(
      (p) => p.ckSide === opponentSide && p.ckPosition === me.ckPosition
    );
  };

  const getResult = (ck, me) => {
    if (!ck?.ckWinner || !me) return "미입력";
    return ck.ckWinner === me.ckSide ? "승" : "패";
  };

  const getLaneOpponentStats = () => {
    const stats = {};

    ckList.forEach((ck) => {
      const me = getMe(ck);
      if (!me) return;

      const opponent = getLaneOpponent(ck, me);
      if (!opponent) return;

      const result = getResult(ck, me);
      if (result === "미입력") return;

      const key = opponent.ckStreamer;
      if (!stats[key]) {
        stats[key] = {
          ckStreamer: opponent.ckStreamer,
          streamerName: opponent.streamerName,
          position: me.ckPosition,
          wins: 0,
          losses: 0,
          total: 0,
        };
      }

      stats[key].total += 1;
      if (result === "승") stats[key].wins += 1;
      else stats[key].losses += 1;
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  };

  const laneOpponentStats = getLaneOpponentStats();
  const [openCkId, setOpenCkId] = useState(null);
  const selectedCk = openCkId ? ckList.find((ck) => ck.ckId === openCkId) : null;

  const getPositionBadgeClass = (participant) => {
    if (!participant) return "bg-secondary text-white";
    return participant.ckStreamer === myStreamerId
      ? "bg-warning text-dark"
      : "bg-secondary text-white";
  };

  const getTeam = (ck, side) => {
    return (ck.participants ?? [])
      .filter((p) => p.ckSide === side)
      .sort(
        (a, b) =>
          POSITION_ORDER.indexOf(a.ckPosition) -
          POSITION_ORDER.indexOf(b.ckPosition)
      );
  };

  // 로딩, 에러, 데이터 없음 상태 처리
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  if (ckList.length === 0) {
    return (
      <div className="alert alert-info mt-3">
        참여한 CK가 없습니다.
      </div>
    );
  }

  return (
    <div className="row g-4">
      <div className="col-12">

        {/* ----- 포지션별 전적 ----- */}
        <div className="mb-4">
          <h4>포지션별 전적</h4>
          <div className="row g-2 mt-2 justify-content-center">
            {["TOP", "JUG", "MID", "AD", "SUP"].map((position) => {
              const positionGames = ckList.filter((ck) => {
                const streamerParticipant = ck.participants.find(
                  (p) => p.ckStreamer === parseInt(streamerId)
                );
                return streamerParticipant?.ckPosition === position;
              });

              const wins = positionGames.filter((ck) => {
                const streamerParticipant = ck.participants.find(
                  (p) => p.ckStreamer === parseInt(streamerId)
                );
                return getResult(ck, streamerParticipant) === "승";
              }).length;

              const losses = positionGames.length - wins;
              const winRate =
                positionGames.length > 0
                  ? (
                      (wins / positionGames.length) * 100
                    ).toFixed(1)
                  : 0;

              return (
                <div key={position} className="col-md-2 col-sm-3">
                  <div className="card text-center bg-black border-secondary ">
                    <div className="card-body">
                      <h6 className="card-title text-white">{position}</h6>
                      <div className="fs-5 fw-bold text-white">
                        {wins}W {losses}L
                      </div>

                      {/* 승률 바 */}
                      <div
                        className="progress mt-2"
                        style={{
                          height: "8px",
                          backgroundColor: "#222"
                        }}
                      >
                        <div className={`progress-bar ${
                            winRate >= 70 ? "bg-success"
                            : winRate >= 50 ? "bg-primary"
                            : winRate >= 30 ? "bg-warning" : "bg-danger"
                          }`}
                          role="progressbar" style={{ width: `${winRate}%` }}
                        />
                      </div>

                      <small className="text-secondary mt-1 d-block">
                        {winRate}%
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h4 className="card-title text-white mb-3">맞라인 전적</h4>
                <div className="table-responsive">
                  <table className="table table-hover table-dark text-center mb-0">
                    <thead className="border-bottom border-white">
                      <tr className="text-uppercase small fw-semibold text-white" style={{ letterSpacing: '0.05em' }}>
                        <th>포지션</th>
                        <th>상대방</th>
                        <th>전적</th>
                        <th>승률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laneOpponentStats.map((stat) => {
                        const winRate = stat.total > 0 ? ((stat.wins / stat.total) * 100).toFixed(1) : 0;
                        return (
                          <tr key={stat.ckStreamer}>
                            <td>{stat.position}</td>
                            <td>{stat.streamerName}</td>
                            <td>{stat.wins}W {stat.losses}L</td>
                            <td>{winRate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                  <h4 className="card-title text-white mb-2 mb-md-0">CK 전적</h4>
                  <div className="text-secondary small">클릭하면 CK 팀원을 모달로 확인할 수 있습니다.</div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover table-dark text-center mb-0">
                    <thead className="border-bottom border-white">
                      <tr className="text-uppercase small fw-semibold text-white" style={{ letterSpacing: '0.05em' }}>
                        <th>날짜</th>
                        <th>포지션</th>
                        <th>결과</th>
                        <th>상대방</th>
                        <th>팀원</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ckList.map((ck) => {
                        const streamerParticipant = getMe(ck);
                        if (!streamerParticipant) return null;

                        const result = getResult(ck, streamerParticipant);
                        const opponent = getLaneOpponent(ck, streamerParticipant);
                        const opponentName = opponent ? opponent.streamerName : "상대 없음";
                        const formattedDate = new Date(ck.ckDate)
                          .toISOString()
                          .split("T")[0];
                        const isOpen = openCkId === ck.ckId;

                        return (
                          <tr
                            key={ck.ckId}
                            className="text-center"
                            style={{
                              backgroundColor:
                                result === "승"
                                  ? "rgba(0, 123, 255, 0.1)"
                                  : "rgba(80, 60, 62, 0.1)",
                            }}
                          >
                            <td className="text-start">{formattedDate}</td>
                            <td>
                              <span className={`badge ${getPositionBadgeClass(streamerParticipant)}`}>
                                {streamerParticipant.ckPosition}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  result === "승"
                                    ? "bg-success"
                                    : result === "패"
                                    ? "bg-danger"
                                    : "bg-secondary"
                                }`}
                              >
                                {result}
                              </span>
                            </td>
                            <td className="text-start">vs {opponentName}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-light"
                                onClick={() => setOpenCkId(isOpen ? null : ck.ckId)}
                              >
                                {isOpen ? "닫기" : "팀원 보기"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedCk && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}
          onClick={() => setOpenCkId(null)}
        >
          <div
            className="card bg-dark text-white border-light shadow"
            style={{ width: 'min(95%, 900px)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex justify-content-between align-items-center border-bottom border-secondary">
              <div>
                <div className="small text-secondary">{new Date(selectedCk.ckDate).toISOString().split('T')[0]}</div>
                <div className="h5 mb-0">CK 팀 구성</div>
              </div>
              <button className="btn btn-sm btn-outline-light" onClick={() => setOpenCkId(null)}>
                닫기
              </button>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-4">
                <div>
                  <div className="small text-secondary">내 포지션</div>
                  <div>{getMe(selectedCk)?.ckPosition ?? "-"}</div>
                </div>
                <div>
                  <div className="small text-secondary">맞라인 상대</div>
                  <div>{getLaneOpponent(selectedCk, getMe(selectedCk))?.streamerName ?? "상대 없음"}</div>
                </div>
                <div>
                  <div className="small text-secondary">결과</div>
                  <div>{getResult(selectedCk, getMe(selectedCk))}</div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border border-danger h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-semibold text-danger">RED 팀</span>
                      {selectedCk.ckWinner === 'red' && <span className="badge bg-danger">승리</span>}
                    </div>
                    {getTeam(selectedCk, 'red').map((p) => (
                      <div
                        key={p.ckParticipantId}
                        className={`d-flex justify-content-between align-items-center py-2 border-bottom border-secondary ${
                          p.ckStreamer === myStreamerId ? 'fw-bold text-warning' : ''
                        }`}
                      >
                        <div>
                          <span className={`badge ${getPositionBadgeClass(p)} me-2`}>{p.ckPosition}</span>
                          {p.streamerName}
                        </div>
                        {getLaneOpponent(selectedCk, getMe(selectedCk))?.ckStreamer === p.ckStreamer && (
                          <span className="badge bg-info text-dark">맞라인</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border border-primary h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-semibold text-primary">BLUE 팀</span>
                      {selectedCk.ckWinner === 'blue' && <span className="badge bg-primary">승리</span>}
                    </div>
                    {getTeam(selectedCk, 'blue').map((p) => (
                      <div
                        key={p.ckParticipantId}
                        className={`d-flex justify-content-between align-items-center py-2 border-bottom border-secondary ${
                          p.ckStreamer === myStreamerId ? 'fw-bold text-warning' : ''
                        }`}
                      >
                        <div>
                          <span className={`badge ${getPositionBadgeClass(p)} me-2`}>{p.ckPosition}</span>
                          {p.streamerName}
                        </div>
                        {getLaneOpponent(selectedCk, getMe(selectedCk))?.ckStreamer === p.ckStreamer && (
                          <span className="badge bg-info text-dark">맞라인</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedCk.ckMemo && (
                <div className="mt-4 text-secondary small">
                  메모: {selectedCk.ckMemo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
