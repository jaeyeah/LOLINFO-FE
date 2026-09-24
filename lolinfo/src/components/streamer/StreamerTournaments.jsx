import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/axios";
import { Helmet } from "react-helmet-async";
import { useParams, useOutletContext } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";
import { MdLooksTwo } from "react-icons/md";
import { buildProfileUrl } from "../../utils/profileUrl";

export default function StreamerTournaments() {
  const { streamer, streamerId } = useOutletContext();
  const [streamerTeam, setStreamerTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleTeamCount, setVisibleTeamCount] = useState(6);
  const loadMoreRef = useRef(null);
  const officialTeams = streamerTeam.filter(team => team.tournamentIsOfficial === "Y");
  const streamerHostTeams = streamerTeam.filter(team => team.tournamentIsOfficial === "N");
  const visibleOfficialTeams = officialTeams.slice(0, visibleTeamCount);
  const visibleStreamerHostTeams = streamerHostTeams.slice(0, visibleTeamCount);
  const hasMoreTeams = visibleTeamCount < Math.max(officialTeams.length, streamerHostTeams.length);

  // 스트리머의 참여 대회 정보 불러오기
  const loadData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`/team/streamer/${streamerId}`, { signal });
      if (signal.aborted) return;
      setStreamerTeam(data);
      setVisibleTeamCount(6);
    }
    catch(err){
      if (signal.aborted) return;
      console.error(err);
      setError("대회 참가 기록을 불러오지 못했습니다.");
    }
    finally{
      if (!signal.aborted) setLoading(false);
    }
  }, [streamerId]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || loading || !hasMoreTeams) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleTeamCount((count) => count + 6);
      }
    }, { rootMargin: "240px" });

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [loading, hasMoreTeams]);

  // 로딩 중일 때 화면출력
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-danger mt-3">
        {error}
      </div>
    );
  }
  // 데이터가 전혀 없을 때
  if (streamerTeam.length === 0) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href={`https://sooplol.com/streamer/${streamerId}`} />
        </Helmet>
        <div className="alert alert-info mt-3">
          참여한 대회가 존재하지 않습니다.
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`https://sooplol.com/streamer/${streamerId}/tournaments`} />
      </Helmet>
    <div className="streamer-tournaments">
      {/* 공식 대회 */}
      <div className="streamer-tournaments-section">
        <span className="section-title-isofficial text-center mt-2"> 공식 </span>
        {officialTeams.length > 0 ? (
          visibleOfficialTeams.map((team) => (
            <div
              className={`card team-card streamer-tournaments-card
                          ${team.teamRanking === "우승" ? "is-champion" : ""}
                          ${team.teamRanking === "준우승" ? "is-second" : ""}`}
              key={team.teamId}
            >
              <div className="streamer-tournaments-layout">
                {/* 대회연도와 배지형 타입구분 */}
                <div className="streamer-tournaments-metadata">
                  <span className={`streamer-year-tag ${team.tournamentYear % 2 === 0 ? "even" : "odd"}`}>
                    {team.tournamentYear}
                  </span>
                  <span className={`tier-text badge ${team.tournamentTierType === "통합" ? "all-tier" : team.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier"}`}>
                    {" "}
                    {team.tournamentTierType}
                  </span>
                  {team.tournamentName?.includes("멸망전") && <span className="badge official-badge2">멸망전</span>}
                  {team.tournamentIsOfficial === "Y" && <span className="badge official-badge">공식</span>}
                </div>
                <div className="streamer-tournaments-body">
                  <div className="streamer-tournaments-header">
                    <div className="tournament-row">
                      <Link to={`/tournament/${team.tournamentId}`} className="tournament-title">
                        {team.tournamentName}
                      </Link>
                      {team.teamName && <span className="team-name">{team.teamName} </span>}
                    </div>
                    <div className="streamer-tournaments-ranking">
                      {team.teamRanking === "우승" ? (
                        <FaTrophy className="fs-3 text-warning" />
                      ) : team.teamRanking === "준우승" ? (
                        <MdLooksTwo className="fs-2 text-light" />
                      ) : (
                        <span className="team-ranking">{team.teamRanking}</span>
                      )}
                    </div>
                  </div>
                  {/* 팀원 정보 */}
                  <div className="streamer-tournaments-roster">
                    <div className="period-box-body team-member">
                      <Link to={`/streamer/${team.teamTop}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.topId)} alt={team.topName} loading="lazy" />
                          <span className={`player-name ${team.topName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.topName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamJug}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.jugId)} alt={team.jugName} loading="lazy" />
                          <span className={`player-name ${team.jugName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.jugName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamMid}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.midId)} alt={team.midName} loading="lazy" />
                          <span className={`player-name ${team.midName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.midName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamAd}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.adId)} alt={team.adName} loading="lazy" />
                          <span className={`player-name ${team.adName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.adName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamSup}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.supId)} alt={team.supName} loading="lazy" />
                          <span className={`player-name ${team.supName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.supName}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-secondary mt-2">참여한 공식 대회가 없습니다.</div>
        )}
      </div>

      {/* 스트리머 개최대회 */}
      <div className="streamer-tournaments-section">
        <span className="section-title-isofficial text-center mt-2"> 스트리머 개최 </span>
        {streamerHostTeams.length > 0 ? (
          visibleStreamerHostTeams.map((team) => (
            <div
              className={`card team-card streamer-tournaments-card
                          ${team.teamRanking === "우승" ? "is-champion" : ""}
                          ${team.teamRanking === "준우승" ? "is-second" : ""}`}
              key={team.teamId}
            >
              <div className="streamer-tournaments-layout">
                {/* 대회연도와 배지형 타입구분 */}
                <div className="streamer-tournaments-metadata">
                  <span className={`streamer-year-tag ${team.tournamentYear % 2 === 0 ? "even" : "odd"}`}>
                    {team.tournamentYear}
                  </span>
                  <span className={`tier-text badge ${team.tournamentTierType === "통합" ? "all-tier" : team.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier"}`}>
                    {" "}
                    {team.tournamentTierType}
                  </span>
                  {team.tournamentName?.includes("멸망전") && <span className="badge official-badge2">멸망전</span>}
                  {team.tournamentIsOfficial === "Y" && <span className="badge official-badge">공식</span>}
                </div>
                <div className="streamer-tournaments-body">
                  <div className="streamer-tournaments-header">
                    <div className="tournament-row">
                      <Link to={`/tournament/${team.tournamentId}`} className="tournament-title">
                        {team.tournamentName}
                      </Link>
                      {team.teamName && <span className="team-name">{team.teamName}</span>}
                    </div>
                    <div className="streamer-tournaments-ranking">
                      {team.teamRanking === "우승" ? (
                        <FaTrophy className="fs-3 text-warning" />
                      ) : team.teamRanking === "준우승" ? (
                        <MdLooksTwo className="fs-2 text-light" />
                      ) : (
                        <span className="team-ranking">{team.teamRanking}</span>
                      )}
                    </div>
                  </div>
                  {/* 팀원 정보 */}
                  <div className="streamer-tournaments-roster">
                    <div className="period-box-body team-member">
                      <Link to={`/streamer/${team.teamTop}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.topId)} alt={team.topName} loading="lazy" />
                          <span className={`player-name ${team.topName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.topName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamJug}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.jugId)} alt={team.jugName} loading="lazy" />
                          <span className={`player-name ${team.jugName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.jugName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamMid}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.midId)} alt={team.midName} loading="lazy" />
                          <span className={`player-name ${team.midName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.midName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamAd}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.adId)} alt={team.adName} loading="lazy" />
                          <span className={`player-name ${team.adName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.adName}
                          </span>
                        </div>
                      </Link>
                      <Link to={`/streamer/${team.teamSup}`} className="streamer-link">
                        <div className="player">
                          <img className="player-profile mb-1" src={buildProfileUrl(team.supId)} alt={team.supName} loading="lazy" />
                          <span className={`player-name ${team.supName === streamer.streamerName ? "highlighted" : ""}`}>
                            {team.supName}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-secondary mt-2">참여한 비공식 대회가 없습니다.</div>
        )}
      </div>
      {hasMoreTeams && (
        <div ref={loadMoreRef} className="text-center py-3" aria-live="polite">
          <div className="spinner-border spinner-border-sm" aria-label="대회 기록 불러오는 중" />
        </div>
      )}
    </div>
    </>
  );
}
