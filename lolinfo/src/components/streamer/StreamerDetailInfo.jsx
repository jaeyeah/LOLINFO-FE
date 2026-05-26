import { Link, useOutletContext } from "react-router-dom";

export default function StreamerDetailInfo() {
  const { streamer, streamerTeam, host, staff, deleteStaff } = useOutletContext();

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
      filter: () => true,
    },
  ];

  return (
    <>
      <div className="row p-2">
        {host.length > 0 && (
          <div className="col-xl-6 mt-2">
            <div className="mb-2">
              <span className="detail-section-title">개최대회</span>
            </div>
            <div className="stat-box">
              {host.map((hostItem) => (
                <div
                  className="row mt-2 text-center text-light align-items-center"
                  key={hostItem.hostTournament}
                >
                  <div className={`col-2 fw-600 ${hostItem.tournamentYear % 2 === 0 ? "text-secondary" : ""}`}>
                    {hostItem.tournamentYear}
                  </div>
                  <div
                    className={`col-2 badge fs-6
                              ${hostItem.tournamentTierType === "천상계" ? "top-tier text-dark"
                      : hostItem.tournamentTierType === "지상계" ? "bottom-tier"
                      : "all-tier"
                    }`}
                  >
                    {hostItem.tournamentTierType}
                  </div>
                  <div className="col-8">
                    <Link to={`/tournament/${hostItem.hostTournament}`} className="streamer-link tournament-title text-warning">
                      {hostItem.tournamentName}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {staff.length > 0 && (
          <div className="col-xl-6 mt-2">
            <div className="mb-2">
              <span className="detail-section-title">감독/코치</span>
            </div>
            <div className="stat-box">
              {staff.map((staffItem) => (
                <div
                  className="row mt-2 text-center text-light align-items-center"
                  key={staffItem.staffTeam}
                >
                  <div className={`col-2 fw-600 ${staffItem.tournamentYear % 2 === 0 ? "text-secondary" : ""}`}>
                    {staffItem.tournamentYear}
                  </div>
                  <span className={`col-2 text-center fs-6 ${staffItem.staffRole === '감독' ? "badge bg-white text-dark" : "badge bg-secondary"}`}>
                    {staffItem.staffRole}
                  </span>
                  <div className="col-2">{staffItem.tournamentName}</div>
                  <div className="col-3 fw-600">{staffItem.teamName}</div>
                  <span className={`col-2 text-center ${staffItem.teamRanking === '우승' ? "badge bg-warning text-dark"
                      : staffItem.teamRanking === "준우승" ? "badge bg-secondary"
                      : staffItem.teamRanking === "4강" ? "badge text-light"
                      : "badge text-secondary"
                    }`}
                  >
                    {staffItem.teamRanking}
                  </span>
                  {deleteStaff && (
                    <button type="button" className="col-1 btn btn-danger p-0" onClick={() => deleteStaff(staffItem.staffStreamer, staffItem.staffTeam)}>
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
                <hr className="text-white mt-2 mb-2" />
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
                        }`}
                      >
                        {team.teamRanking}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
