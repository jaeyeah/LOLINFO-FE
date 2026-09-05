import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import { buildProfileUrl } from "../../utils/profileUrl";
import "./HomeBookmark.css";

function getWinRate(playCount, winCount) {
	if (!playCount) return 0;
	return Math.round((winCount / playCount) * 100);
}

function BookmarkHeading({ description, showViewAll = false }) {
	return (
		<div className="home-bookmark-heading">
			<div className="home-section-heading">
				<p className="home-eyebrow">FAVORITE STREAMERS</p>
				<p className="home-bookmark-description">{description}</p>
			</div>
			{showViewAll && (
				<Link to="/mypage/bookmark" className="home-bookmark-view-all">전체보기 →</Link>
			)}
		</div>
	);
}

function BookmarkCard({ streamer }) {
	const {
		streamerNo,
		streamerName,
		streamerSoopId,
		totalPlayCount,
		totalWinCount,
		totalLoseCount,
		recentPlayCount,
		recentWinCount,
		recentLoseCount,
		recentWinRate,
		recentResults = [],
	} = streamer;
	const detailPath = `/streamer/${streamerNo}/ck-records`;
	const totalWinRate = getWinRate(totalPlayCount, totalWinCount);
      const getWinRateColor = (rate) => {
        if (rate >= 60) return "#76c1ff";
        if (rate >= 55) return "#69db7c";
        if (rate >= 50) return "#adb5bd";
        if (rate >= 45) return "#bdb088";
        if (rate >= 40) return "#ffba79";
        return "#ff6b6b";
    };

	return (
		<Link to={detailPath} className="home-bookmark-card">
			<div className="home-bookmark-card-header">
				<div className="home-bookmark-profile">
					<img
						src={buildProfileUrl(streamerSoopId)}
						alt={`${streamerName} 프로필`}
						className="home-bookmark-avatar"
						loading="lazy"
					/>
					<h3>{streamerName}</h3>
				</div>
				<span className="home-bookmark-card-arrow" aria-hidden="true">→</span>
			</div>

			<div className="home-bookmark-stat">
				{totalPlayCount === 0 ? (
                    <p className="home-bookmark-empty-stat">아직 등록된 CK 기록이 없습니다.</p>
				) : (
                    <>
                    <span className="home-bookmark-stat-label">전체 CK 전적 : <span className="home-bookmark-rate ms-1 fw-bold" style={{ color: getWinRateColor(totalWinRate) }}> {totalWinRate}% </span></span>
                        <strong>{totalPlayCount}전 {totalWinCount}승 {totalLoseCount}패</strong>
						<div className="home-bookmark-progress" aria-label={`전체 CK 승률 ${totalWinRate}%`}>
							<span className="home-bookmark-progress-bar" style={{ width: `${totalWinRate}%` }} />
						</div>
					</>
				)}
			</div>

			<div className="home-bookmark-stat home-bookmark-recent-stat ">
				<span className="home-bookmark-stat-label">
					{recentPlayCount === 10 ? "최근 10경기 CK" : `최근 ${recentPlayCount}경기 CK`}
				</span>
				{recentResults.length > 0 ? (
					<div className="home-bookmark-results" aria-label="최근 경기 결과">
						{recentResults.map((result, index) => (
							<span
								className={`home-bookmark-result home-bookmark-result-${result === "W" ? "win" : "lose"}`}
								key={`${result}-${index}`}
							>
								{result === "W" ? "승" : "패"}
							</span>
						))}
					</div>
				) : (
					<p className="home-bookmark-empty-stat">최근 CK 기록이 없습니다.</p>
				)}
				<span className="home-bookmark-recent-summary mt-1">
					{recentWinCount}승 {recentLoseCount}패 · 승률 {recentWinRate}%
				</span>
				{recentResults.length > 0 && (
					<div className="home-bookmark-progress" aria-label={`최근 CK 승률 ${recentWinRate}%`}>
						<span className="home-bookmark-progress-bar home-bookmark-progress-bar-recent" style={{ width: `${recentWinRate}%` }} />
					</div>
				)}
			</div>
		</Link>
	);
}

export default function HomeBookmark({ isLogin }) {
	const [streamers, setStreamers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (!isLogin) return;

		let isMounted = true;
		setIsLoading(true);
		setHasError(false);

		axios.get("/bookmark/streamer/home")
			.then((response) => {
				if (isMounted) setStreamers(Array.isArray(response.data) ? response.data : []);
			})
			.catch(() => {
				if (isMounted) setHasError(true);
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [isLogin]);

	if (!isLogin) {
		return (
			<section className="home-bookmark-section" aria-labelledby="home-bookmark-title">
				<BookmarkHeading description="로그인하고 관심 스트리머의 CK 전적을 한눈에 확인하세요." />
				<Link to="/member/login" state={{ from: "/" }} className="home-bookmark-state home-bookmark-state-link">
					<span>로그인하고 관심 스트리머의 전적을 확인해보세요.</span>
					<strong>로그인하기 →</strong>
				</Link>
			</section>
		);
	}

	if (isLoading) {
		return (
			<section className="home-bookmark-section" aria-labelledby="home-bookmark-title" aria-live="polite">
				<BookmarkHeading description="관심 스트리머의 전체 CK 전적과 최근 경기 결과입니다." />
				<div className="home-bookmark-state">
				<span className="spinner-border spinner-border-sm text-info" aria-hidden="true" />
				<span>즐겨찾기 스트리머 전적을 불러오는 중입니다.</span>
				</div>
			</section>
		);
	}

	if (hasError) {
		return (
			<section className="home-bookmark-section" aria-labelledby="home-bookmark-title" role="alert">
				<BookmarkHeading description="관심 스트리머의 전체 CK 전적과 최근 경기 결과입니다." />
				<div className="home-bookmark-state">
				즐겨찾기 정보를 불러오지 못했습니다.
				</div>
			</section>
		);
	}

	if (streamers.length === 0) {
		return (
			<section className="home-bookmark-section" aria-labelledby="home-bookmark-title">
				<BookmarkHeading description="관심 스트리머를 등록하고 최근 전적을 확인하세요." />
				<Link to="/streamer" className="home-bookmark-state home-bookmark-state-link">
					<span>아직 등록한 즐겨찾기 스트리머가 없습니다.</span>
					<strong>스트리머 찾기 →</strong>
				</Link>
			</section>
		);
	}

	return (
		<section className="home-bookmark-section" aria-labelledby="home-bookmark-title">
			<BookmarkHeading
				description="관심 스트리머의 전체 CK 전적과 최근 경기 결과입니다."
				showViewAll
			/>
			<div className="home-bookmark-grid">
				{streamers.slice(0, 10).map((streamer) => (
					<BookmarkCard key={streamer.streamerNo} streamer={streamer} />
				))}
			</div>
		</section>
	);
}
