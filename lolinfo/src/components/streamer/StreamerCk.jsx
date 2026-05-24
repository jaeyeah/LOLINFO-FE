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

  // 승리팀 판단
  const getResult = (ckWinner, ckSide) => {
    return ckWinner === ckSide ? "승" : "패";
  };

  // 상대팀 정보 (같은 CK에서 다른 팀)
  const getOpponent = (ck, currentSide) => {
    const opponentSide = currentSide === "레드" ? "블루" : "레드";
    const opponent = ck.participants.find((p) => p.ckSide === opponentSide);
    return opponent ? opponent.streamerName : "상대방";
  };

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
                return getResult(ck.ckWinner, streamerParticipant.ckSide) === "승";
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

        <div className="mb-3">
          <h4>CK 전적</h4>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-dark">
            <thead>
              <tr className="text-center">
                <th>날짜</th>
                <th>포지션</th>
                <th>결과</th>
                <th>상대방</th>
              </tr>
            </thead>
            <tbody>
              {ckList.map((ck) => {
                // 현재 스트리머가 속한 팀 찾기
                const streamerParticipant = ck.participants.find(
                  (p) => p.ckStreamer === parseInt(streamerId)
                );

                if (!streamerParticipant) return null;

                const result = getResult(ck.ckWinner, streamerParticipant.ckSide);
                const opponent = getOpponent(ck, streamerParticipant.ckSide);
                const formattedDate = new Date(ck.ckDate)
                  .toISOString()
                  .split("T")[0];

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
                      <span
                        className={`badge ${
                          streamerParticipant.ckPosition === "TOP"
                            ? "bg-warning text-dark"
                            : streamerParticipant.ckPosition === "JUG"
                            ? "bg-success"
                            : streamerParticipant.ckPosition === "MID"
                            ? "bg-info"
                            : streamerParticipant.ckPosition === "AD"
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {streamerParticipant.ckPosition}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          result === "승" ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {result}
                      </span>
                    </td>
                    <td className="text-start">vs {opponent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        
      </div>
    </div>
  );
}
