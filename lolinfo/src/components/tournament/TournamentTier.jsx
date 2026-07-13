import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import StreamerTierModal from "./StreamerTierModal";



// 티어별 스타일 반환함수
const getTierGroupClass = (tierName) => {
  if (["Transcended", "God", "Legendary", "Unique"].includes(tierName)) {
    return "tier-rank-special";
  }

  if (["SSR", "SR", "R"].includes(tierName)) {
    return "tier-rank-rare";
  }

  if (tierName.startsWith("S")) return "tier-rank-s";
  if (tierName.startsWith("A")) return "tier-rank-a";
  if (tierName.startsWith("B")) return "tier-rank-b";
  if (tierName.startsWith("C")) return "tier-rank-c";
  if (tierName.startsWith("D")) return "tier-rank-d";
  if (tierName.startsWith("E")) return "tier-rank-e";
  if (tierName.startsWith("F")) return "tier-rank-f";

  return "tier-rank-undecided";
};

const POSITIONS = ["TOP", "JUG", "MID", "AD", "SUP"];

const POSITION_LABELS = {
  TOP: "탑",
  JUG: "정글",
  MID: "미드",
  AD: "원딜",
  SUP: "서폿",
};

const TIER_GRADES = [
  "Transcended",
  "God",
  "Legendary",
  "Unique",
  "SSR",
  "SR",
  "R",
  "S+",
  "S",
  "S-",
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "E+",
  "E",
  "E-",
  "F",
  "미정",
];


export default function TournamentTier() {
  const { tournamentId } = useParams();
  const { tournament, isAdmin } = useOutletContext();
  const [tierList, setTierList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadTierList = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/streamer/tier/${tournamentId}`);
      setTierList(data || []);
    } catch (err) {
      console.error("티어 목록 조회 오류", err);
      setError("티어 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadTierList();
  }, [loadTierList]);

  const openTierModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeTierModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const tierTable = useMemo(() => {
    return TIER_GRADES.map((tierName) => {
      const row = POSITIONS.map((position) => {
        const items = tierList.filter(
          (item) => item.tierName === tierName && item.tierPosition === position
        );
        return { position, items };
      });
      return { tierName, row };
    });
  }, [tierList]);

  return (
  <section className="tournament-tier-page">
    <div className="tier-board">
      <header className="tier-board-header">
        <div className="tier-board-heading">
          <div className="tier-title-area">
            <span className="tier-title-eyebrow">STREAMER TIER BOARD</span>

            <h2 className="tier-title">
              대회 스트리머 티어표
            </h2>

            <p className="tier-description">
              대회 기준으로 포지션별 스트리머 티어를 확인할 수 있습니다.
            </p>
          </div>

          <div className="tier-header-meta">
            {tournament?.tournamentName && (
              <div className="tier-tournament-name">
                <span className="tier-meta-label">현재 대회</span>
                <strong>{tournament.tournamentName}</strong>
              </div>
            )}

            <div className="tier-streamer-count">
              <span className="tier-meta-label">등록 인원</span>
              <strong>{tierList.length}명</strong>
            </div>

            {isAdmin === true && (
              <button
                type="button"
                className="tier-register-button"
                onClick={openTierModal}
              >
                <span className="tier-register-icon">+</span>
                티어 등록
              </button>
            )}
          </div>
        </div>
      </header>

      {loading && (
        <div className="tier-status-area">
          <div
            className="spinner-border spinner-border-sm text-info"
            role="status"
          />
          <span>티어 정보를 불러오는 중입니다.</span>
        </div>
      )}

      {error && (
        <div className="tier-error-message">
          <div>
            <strong>티어 정보를 불러오지 못했습니다.</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={loadTierList}
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="tier-table-container">
          <table className="tier-board-table">
            <thead>
              <tr>
                <th className="tier-column-heading tier-name-heading">
                  TIER
                </th>

                {POSITIONS.map((position) => (
                  <th
                    key={position}
                    className={`tier-column-heading position-${position.toLowerCase()}`}
                  >
                    <span className="position-code">{position}</span>
                    <span className="position-label">
                      {POSITION_LABELS[position]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tierTable.map(({ tierName, row }) => {
                const tierCount = row.reduce(
                  (total, current) => total + current.items.length,
                  0
                );

                return (
                  <tr key={tierName} className="tier-table-row">
                    <th className="tier-name-cell">
                      <div
                        className={`tier-rank-label ${getTierGroupClass(
                          tierName
                        )}`}
                      >
                        <span className="tier-rank-name">{tierName}</span>

                        {tierCount > 0 && (
                          <span className="tier-rank-count">
                            {tierCount}
                          </span>
                        )}
                      </div>
                    </th>

                    {row.map(({ position, items }) => (
                      <td
                        key={`${tierName}-${position}`}
                        className="tier-streamer-cell"
                      >
                        {items.length > 0 ? (
                          <div className="tier-streamer-list">
                            {items.map((item) => (
                              <Link
                                key={`${item.streamerNo}-${position}`}
                                to={`/streamer/${item.streamerNo}`}
                                className="tier-streamer-chip"
                              >
                                <span className="streamer-chip-dot" />
                                <span className="streamer-chip-name">
                                  {item.streamerName}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="tier-empty-cell">
                            <span />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <StreamerTierModal
        show={showModal}
        tournamentId={tournamentId}
        onClose={closeTierModal}
        onSuccess={loadTierList}
      />
    </div>
  </section>
);
}
