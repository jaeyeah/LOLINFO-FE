import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useParams, Outlet, useNavigate } from "react-router-dom";
import "./Streamer.css";
import { FaEdit, FaHome } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { adminState, loginState } from "../../utils/jotai";
import Swal from "sweetalert2";

export default function StreamerDetail() {

    const isAdmin = useAtomValue(adminState);
    const isLogin = useAtomValue(loginState);
    const {streamerId} = useParams();
    const [streamer, setStreamer] = useState({});
    const [bookmarked, setBookmarked] = useState(false);
    const navigate = useNavigate();
    //로딩중 설정
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadData = useCallback( async() => {
        try {
            setLoading(true);
            setError(null);
            const {data} = await axios.get(`/streamer/${streamerId}`);
            setStreamer(data);
        } catch (error) {
            console.error("Error fetching streamer detail:", error);
            setError("스트리머 정보를 불러오지 못했습니다.");
        }
        finally {
          setLoading(false);
        }
    }, [streamerId]);

    //북마크 설정
    const toggleBookmark=async() =>{
      if (!isLogin) {
          const result = await Swal.fire({
            icon: "warning",
            title: "로그인이 필요합니다",
            text: "로그인 페이지로 이동하시겠습니까?",
            showCancelButton: true,
            confirmButtonText: "이동",
            cancelButtonText: "취소",
          });

          if (result.isConfirmed) {
            navigate("/member/login");
          }
          return;
        }
      try{
        const {data} = await axios.post('/bookmark/streamer',null,{
          params : {streamerId : streamerId}
        })
        setBookmarked(data);
        if(data) {console.log("등록 성공");}
        else{console.log("삭제");}
      } catch(error){
        console.error(error);
      }
    };




    useEffect(()=>{
        loadData();
    },[streamerId, loadData]);


    //render
    return (<>
    
    <div className="row">
        <div className="col text-center">
            <h2 className="page-title p-3">{streamer.streamerName} : 상세</h2>
        </div>
    </div>
    {/* 로딩중 or 에러 */}
    {loading && (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border" role="status" />
        </div>
    )}

    {streamer.streamerName !== "SLL" && streamer.streamerName !== "멸망전" && (
        <>
          {/* 참여 대회 탭 네비게이션 */}
          <div className="row mt-2">
            <div className="col-12">
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <NavLink to="" end className={({ isActive }) => (isActive ? "btn btn-primary" : "btn btn-outline-primary")}>
                  경력
                </NavLink>
                <NavLink to="tournaments" className={({ isActive }) => (isActive ? "btn btn-primary" : "btn btn-outline-primary")}>
                  참여대회
                </NavLink>
                <NavLink to="ck-records" className={({ isActive }) => (isActive ? "btn btn-primary" : "btn btn-outline-primary")}>
                  CK 전적
                </NavLink>
                <NavLink to="streamerWith" className={({ isActive }) => (isActive ? "btn btn-primary" : "btn btn-outline-primary")}>
                  팀메이트
                </NavLink>
              </div>
            </div>
          </div>
        </>
    )}


    {error && <p className="text-danger">{error}</p>}
    {/* 스트리머 상세 */}
    <div className="streamer-wrapper">
      <div className="card streamer-card">
        <div className="card-body">
          {/* 상단: 프로필 + 이름 + 버튼들 */}
          <div className="row align-items-center">
            <div className="col-auto">
              <img src={streamer.streamerProfile} className="streamer-profile"/>
            </div>
            <div className="col">
              <h3 className="card-title mb-1">{streamer.streamerName}</h3>
              <p className="card-text mb-0">@{streamer.streamerSoopId}</p>
            </div>
            <div className="col-auto text-end">
                <button type="button" className={`btn mb-2 ${bookmarked ? "btn-warning" : "btn-outline-warning"}`}
                        onClick = {toggleBookmark}>
                      {bookmarked ? "★" : "☆"}
                    </button>
                <a href={streamer.streamerStation} target="_blank" rel="noreferrer"
                    className="btn btn-station mb-2"><FaHome className="fs-2"/> </a>
                {isAdmin === true && (
                     <NavLink to={`/streamer/edit/${streamerId}`}
                    className="btn btn-station mb-2 ms-1 bg-warning"><FaEdit className="fs-2"/> </NavLink>
                )}
            </div>
          </div>
          </div>
        </div>
        {/* 중첩 라우트 렌더링 */}
        <Outlet context={{ streamer, streamerId }} />
      </div>

    


    </>)

}