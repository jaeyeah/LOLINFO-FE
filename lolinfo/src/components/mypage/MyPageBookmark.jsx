import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import "./Bookmark.css";

export default function MyPageBookmark() {
    // 상태 관리
    
    const loginId = useAtomValue(loginIdState);
    const [bookmarkStreamerList, setBookmarkStreamerList] = useState ([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBookmarkStreamerList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get("/bookmark/streamer");
            setBookmarkStreamerList(data);
            console.log(data);
        } catch (error) {
            console.error(error);
            setError("즐겨찾기 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookmarkStreamerList();
    }, [loadBookmarkStreamerList]);


    //승률별 색상적용
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
    <div className="container my-4">
    <h3 className="mb-4">즐겨찾기한 스트리머</h3>
        {loading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-light" role="status" />
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && bookmarkStreamerList.length === 0 && (
            <div className="card bg-dark border-secondary text-white p-4 text-center">
              등록된 즐겨찾기가 없습니다.
            </div>
          )}

          {!loading && !error && bookmarkStreamerList.length > 0 && (
            <div className="row g-3">
            {bookmarkStreamerList.map((bookmark) => (
                <div className="col-xl-4 col-lg-6" key={bookmark.streamerNo}>
                <Link to={`/streamer/${bookmark.streamerNo}`} className="text-decoration-none">
                    <div className="bookmark-card">
                        <div className="d-flex align-items-center">

                            <img  src={buildProfileUrl(bookmark.streamerSoopId)} alt={bookmark.streamerName} className="bookmark-avatar"/>

                            <div className="ms-3 flex-grow-1">

                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-1 text-white fw-bold">
                                    {bookmark.streamerName}
                                    </h5>
                                    {/* 대회 성적 */}
                                    <div className="d-flex gap-2 flex-wrap">
                                        {!!bookmark.officialRanking1 && (
                                            <span className="badge badge-gold">🏆 {bookmark.officialRanking1}</span>
                                        )}
                                        {!!bookmark.officialRanking2 && (
                                            <span className="badge badge-silver">🥈 {bookmark.officialRanking2} </span>
                                        )}
                                        {!!bookmark.officialRanking3 && (
                                            <span className="badge badge-bronze">🥉 {bookmark.officialRanking3}</span>
                                        )}
                                    </div>
                                </div>
                                {/* CK 성적 */}
                                <div className="d-flex justify-content-between">
                                    <span className="small text-secondary mb-2">
                                        CK {bookmark.ckWinCount}승 · {bookmark.ckLoseCount}패
                                    </span>
                                    <span className="fw-semibold" style={{ color: getWinRateColor(bookmark.ckWinRate) }}>
                                        {bookmark.ckWinRate}%
                                    </span>
                                </div>

                                <div className="progress bookmark-progress">
                                    <div
                                    className="progress-bar"
                                    style={{
                                        width: `${bookmark.ckWinRate}%`,
                                    }}
                                    />
                                </div>
                                

                            </div>

                        </div>
                    </div>
                </Link>
                </div>
            ))}
            </div>
          )}
    </div>
    </>
  );
}