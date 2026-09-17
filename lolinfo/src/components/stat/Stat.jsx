import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { getKoreaToday } from "../../utils/ckPeriod";
import MonthlyActivityChart from "./MonthlyActivityChart";
import "./Stat.css";

const MONTH_COUNT = 12;

function normalizeMonthlyStats(payload) {
	if (!Array.isArray(payload?.months)) {
		throw new Error("잘못된 월별 통계 응답 형식");
	}

	const months = payload.months.map((item) => Number(item?.month));
	if (months.some((month) => !Number.isInteger(month) || month < 1 || month > MONTH_COUNT)) {
		throw new Error("월별 통계 응답에 월 정보가 없습니다");
	}

	const monthMap = new Map(payload.months.map((item) => [Number(item.month), item]));
	return Array.from({ length: MONTH_COUNT }, (_, index) => {
		const month = index + 1;
		const item = monthMap.get(month);
		return {
			month,
			ckCount: Number(item?.ckCount) || 0,
			participantCount: Number(item?.participantCount) || 0,
			tournamentCount: Number(item?.tournamentCount) || 0,
			tournaments: Array.isArray(item?.tournaments) ? item.tournaments : [],
		};
	});
}

export default function Stat() {
	const currentYear = Number(getKoreaToday().slice(0, 4));
	const [selectedYear, setSelectedYear] = useState(String(currentYear));
	const [months, setMonths] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		const year = Number(selectedYear);

		if (!Number.isInteger(year) || year < 1 || year > 9999) {
			setLoading(false);
			setError("조회할 연도를 입력해주세요.");
			return () => controller.abort();
		}

		const fetchMonthlyStats = async () => {
			setLoading(true);
			setError(null);
			setMonths(null);

			try {
				const { data } = await axios.get("/stats/monthly", {
					params: { year },
					signal: controller.signal,
				});

				if (!controller.signal.aborted) {
					setMonths(normalizeMonthlyStats(data));
				}
			} catch (requestError) {
				if (controller.signal.aborted || axios.isCancel(requestError)) return;
				console.error("월별 활동 통계 조회 실패", requestError);
				setError("월별 활동 통계를 불러오지 못했습니다.");
				setMonths([]);
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		};

		fetchMonthlyStats();
		return () => controller.abort();
	}, [selectedYear]);

	return (
		<main className="stat-page" aria-labelledby="stat-page-title">
			<header className="stat-page-header">
				<div>
					<p className="stat-page-eyebrow">SOOPLOL DATA</p>
					<h1 id="stat-page-title">월별 활동 통계</h1>
				</div>
				<label className="stat-year-control">
					<span>조회 연도</span>
					<input
						className="form-control form-control-sm"
						type="number"
						min="1"
						max="9999"
						value={selectedYear}
						onChange={(event) => setSelectedYear(event.target.value)}
						aria-label="조회 연도"
					/>
				</label>
			</header>

			{loading ? (
				<p className="stat-status" role="status">월별 활동 통계를 불러오는 중입니다...</p>
			) : error ? (
				<p className="stat-status stat-status-error" role="alert">{error}</p>
			) : months.length === 0 ? (
				<p className="stat-status">조회할 월별 활동 데이터가 없습니다.</p>
			) : (
				<section className="stat-chart-panel" aria-labelledby="monthly-activity-title">
					<div className="stat-chart-heading">
						<h2 id="monthly-activity-title">{selectedYear}년 월별 활동 추이</h2>
						<p>CK 경기 수, 참여 스트리머 수, 대회 수를 월별로 비교합니다.</p>
					</div>
					<div className="stat-chart-body">
						<MonthlyActivityChart months={months} />
					</div>
				</section>
			)}
		</main>
	);
}
