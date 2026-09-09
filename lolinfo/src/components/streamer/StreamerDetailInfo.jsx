import { Link, useOutletContext } from "react-router-dom";
import "./StreamerDetailInfo.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAtomValue } from "jotai";
import { adminState, loginState } from "../../utils/jotai";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const participationTotalPlugin = {
  id: "streamerParticipationTotal",
  afterDraw(chart, _args, options) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const arc = chart.getDatasetMeta(0).data[0];
    const x = arc?.x ?? (chartArea.left + chartArea.right) / 2;
    const y = arc?.y ?? (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.fillStyle = "#f8f9fa";
    ctx.font = "600 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`총 ${options.total.toLocaleString()}회`, x, y, Math.max((arc?.innerRadius ?? 65) * 1.8, 1));
    ctx.restore();
  },
};
const RECORD_CHART_PLUGINS = [participationTotalPlugin];
const RECORD_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#ced4da", usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 12 },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
          const percent = total > 0 ? (context.parsed / total * 100).toFixed(1) : "0.0";
          return `${context.label}: ${context.parsed}회 (${percent}%)`;
        },
      },
    },
  },
};

export default function StreamerDetailInfo() {
  const { streamer, streamerId } = useOutletContext();
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const [streamerTeam, setStreamerTeam] = useState([]);
  const [host, setHost] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
      if (!streamerId) return;

      setLoading(true);
      setError(null);

      let finishedCount = 0;

      const finishOne = () => {
        finishedCount += 1;
        if (finishedCount === 3) {setLoading(false); }
      };

      axios.get(`/team/streamer/${streamerId}`)
        .then(res => setStreamerTeam(res.data))
        .catch(error => {
          console.error("팀 정보 로드 실패:", error);
          setError("팀 정보를 불러오지 못했습니다.");
        }).finally(finishOne);

      axios.get(`/host/streamer/${streamerId}`)
        .then(res => setHost(res.data))
        .catch(error => {
          console.error("주최 정보 로드 실패:", error);
          setError("주최 정보를 불러오지 못했습니다.");
        }) .finally(finishOne);

      axios.get(`/staff/streamer/${streamerId}`)
        .then(res => setStaff(res.data))
        .catch(error => {
          console.error("감독/코치 정보 로드 실패:", error);
          setError("감독/코치 정보를 불러오지 못했습니다.");
        }) .finally(finishOne);
    }, [streamerId]);

      useEffect(() => {
          loadData();
      }, [loadData]);

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
    }, [loadData]);

  // 로딩 중일 때 화면출력
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border" role="status" />
      </div>
    );
  }
  // 에러 발생 시 화면출력
  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }


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
  ].map((section) => {
    const teams = streamerTeam.filter(section.filter);
    const total = teams.length;
    const counts = section.stats.map((stat) => Number(stat.value ?? 0));
    const placedTotal = counts.reduce((sum, value) => sum + value, 0);
    // 집계가 참가 수를 초과하면 임의로 횟수를 줄이거나 비율을 왜곡하지 않는다.
    const chartAvailable = counts.every((count) => Number.isInteger(count) && count >= 0) && placedTotal <= total;
    return {
      ...section,
      teams,
      total,
      chartAvailable,
      chartData: {
        labels: ["우승", "준우승", "4강", "기타"],
        datasets: [{
          data: [...counts, Math.max(total - placedTotal, 0)],
          backgroundColor: ["#c9ad63", "#b8c0cc", "#ac8870", "#495057"],
          borderWidth: 0,
          hoverOffset: 3,
        }],
      },
    };
  });

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
                    className={`col-3 badge fs-6 tier-badge
                              ${hostItem.tournamentTierType === "천상계" ? "top-tier text-dark"
                      : hostItem.tournamentTierType === "지상계" ? "bottom-tier"
                      : "all-tier"
                    }`}
                  >
                    {hostItem.tournamentTierType}
                  </div>
                  <div className="col-7">
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
                  className="row mt-2 text-center text-light align-items-center staff-row"
                  key={staffItem.staffTeam}
                >
                  <div className={`col-2 fw-600 ${staffItem.tournamentYear % 2 === 0 ? "text-secondary" : ""}`}>
                    {staffItem.tournamentYear}
                  </div>
                  <span className={`col-2 text-center fs-6 ${staffItem.staffRole === '감독' ? "badge bg-white text-dark" : "badge bg-secondary"}`}>
                    {staffItem.staffRole}
                  </span>
                  <div className="col-2 staff-wrap">{staffItem.tournamentName}</div>
                  <div className="col-3 fw-600 staff-wrap">{staffItem.teamName}</div>
                  <span className={`col-2 text-center ${staffItem.teamRanking === '우승' ? "badge bg-warning text-dark"
                      : staffItem.teamRanking === "준우승" ? "badge bg-secondary"
                      : staffItem.teamRanking === "4강" ? "badge text-light"
                      : "badge text-secondary"
                    }`}
                  >
                    {staffItem.teamRanking}
                  </span>
                  
                  {isAdmin && deleteStaff && (
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
          const filteredTeams = section.teams;

          return (
            <div className="col-md-6" key={section.key}>
              <div className="mb-2">
                <span className="detail-section-title">{section.title}</span>
              </div>
              <div className="stat-box">
                {section.chartAvailable ? (
                  <div className="streamer-record-chart">
                    <Doughnut data={section.chartData} plugins={RECORD_CHART_PLUGINS}
                      options={{
                        ...RECORD_CHART_OPTIONS,
                        plugins: {
                          ...RECORD_CHART_OPTIONS.plugins,
                          streamerParticipationTotal: { total: section.total },
                        },
                      }}
                      role="img" aria-label={`${section.title}, 총 ${section.total}회. ${section.chartData.labels.map((label, index) => `${label} ${section.chartData.datasets[0].data[index]}회`).join(", ")}`} />
                  </div>
                ) : (
                  <p className="streamer-record-chart-notice" role="status">
                    참가 대회 수와 입상 통계가 일치하지 않아 차트를 표시할 수 없습니다.
                  </p>
                )}
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
