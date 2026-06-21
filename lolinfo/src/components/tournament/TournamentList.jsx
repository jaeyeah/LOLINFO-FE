import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Tournament.css";
import { buildProfileUrl } from "../../utils/profileUrl";
import { useAtomValue } from "jotai";
import { adminState, loginState } from "../../utils/jotai";
import Pagination from "../Pagination";
import { FaSearch } from "react-icons/fa";

export default function TournamentList(){

    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);
    const [tournamentList, setTournamentList] = useState([]); 
    //검색어 state
    const [keyword, setKeyword] = useState(""); // 검색창
    const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 저장용
   // 페이지네이션 설정
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });
    //로딩중 설정
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback( async() => {
        try {
            setLoading(true);
            setError(null);
            const {data} = await axios.get("/tournament/", {params : {page, keyword: searchKeyword || undefined}}); 
            setTournamentList(data.list);
            setPageData(data.pageVO);
        } catch (error) {
            console.error("Error fetching tournament list:", error);
            setError("목록을 불러오지 못했습니다.");
        }
        finally {
          setLoading(false);
        }
    }, [page, searchKeyword]); 

    useEffect(()=>{
        loadData();
    },[loadData]);

    //[입력창 제어 및 검색이동]
    const handleSearch = useCallback(async() => {
      if(keyword.trim().length === 0){
          alert("검색어를 입력해주세요.");
          return;
      }
      setPage(1);
      try {
          const {data} = await axios.get(`/tournament/`, {params : {page, keyword}});
          setTournamentList(data.list);
          setPageData(data.pageVO);
          setSearchKeyword(keyword);
      } catch (error) {
          console.error("Error fetching streamer list:", error);
          setError("검색목록을 불러오지 못했습니다.");
      }
      setKeyword("");
    }, [keyword, page]);


    function formatDate(value) {
      const d = new Date(value);
      const yy = String(d.getFullYear()).slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}년 ${mm}월${dd}일`;
  }


//render
return(<>
  <h2 className="section-title text-center ">Soop : LoL 대회 목록</h2>
  <div className="row mt-3 justify-content-center">
        <div className="col-12 col-xl-8">
            <div className="streamer-control-panel">
                <div className="search-wrapper flex-grow-1">
                    <div className="input-group streamer-search-group">
                        <input
                            type="text"
                            className="search form-control search-bar text-light"
                            value={keyword}
                            placeholder="대회 검색"
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                        />
                        <button className="search btn btn-success" onClick={handleSearch}>
                            <FaSearch className="fs-4" />
                        </button>
                    </div>
                </div>
                {/* 등록창 */}
                {isAdmin === true && (
                  <div className="streamer-admin-action">
                      <Link to="/tournament/insert" className="btn btn-success">등록</Link>
                  </div>
                )}
            </div>
        </div>
    </div>
  
  
  <div className="row mt-3 justify-content-center">
    <div className="col-12 col-xl-8 tournament-wrapper">
      {/* 로딩중 or 에러 */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      )}
      {error && <p className="text-danger">{error}</p>}
      {/* 토너먼트 목록 */}
      {tournamentList.map((tournament) => (
        <Link
          to={`/tournament/${tournament.tournamentId}`}
          key={tournament.tournamentId}
          className="card tournament-card mb-3"
        >
          <div className="row g-0 tournament-row">
            {/* 연도 */}
            <div className="col-md-2 col-3 year-tag">{tournament.tournamentYear}</div>

            {/* 가운데 내용 */}
            <div className="col-md-4 col-9">
              <div className="card-body py-3">
                <div className="tournament-top">
                  <span className={`tier-text badge ${tournament.tournamentTierType === "통합" ? "all-tier" : tournament.tournamentTierType === "천상계" ? "top-tier" : "bottom-tier" }`}> {tournament.tournamentTierType}</span>
                  {/* 공식 대회 여부 : 배지 */}
                  {tournament.tournamentIsofficial === "Y" && (
                    <span className="badge official-badge ms-2">공식</span>
                  )}
                  {tournament.tournamentName?.includes("멸망전") && (
                    <span className="badge official-badge2 ms-2">멸망전</span>
                  )}
                </div>
                {/* 대회명 */}
                <h5 className="tournament-title mt-2">
                  {tournament.tournamentName}
                </h5>
                {/* 기간 */}
                {tournament.tournamentStart && (
                <span className="period-text">
                  {formatDate(tournament.tournamentStart)} ~ {formatDate(tournament.tournamentEnd)}
                </span>
              )}
              </div>
            </div>
            <div className="col-md-6 col-12 period-box ">
              <div className="period-box-header team-badge">
                <div className="col">
                  <span className="text-light fs-5">{tournament.teamName}</span>
                </div>
              </div>
              <div className="period-box-body">
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.topId)} alt={tournament.topName}/>
                  <br/><span className="player-name">{tournament.topName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.jugId)} alt={tournament.jugName}/>
                  <br/><span className="player-name">{tournament.jugName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.midId)} alt={tournament.midName}/>
                  <br/><span className="player-name">{tournament.midName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.adId)} alt={tournament.adName}/>
                  <br/><span className="player-name">{tournament.adName}</span>
                </div>
                <div className="player">
                  <img className="player-profile"src={buildProfileUrl(tournament.supId)} alt={tournament.supName}/>
                  <br/><span className="player-name">{tournament.supName}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
  {/* 페이지네이션 */}
      <div className ="row mt-1">
          <div className="col-6 offset-3">
              <Pagination
                  page={page}
                  totalPage={pageData.totalPage}
                  blockStart={pageData.blockStart}
                  blockFinish={pageData.blockFinish}
                  onPageChange={setPage}
              />
          </div>
      </div>
      </>)
  }