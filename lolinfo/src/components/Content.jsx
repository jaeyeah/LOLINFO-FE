import { Navigate, Route, Routes } from "react-router-dom";

import StreamerList from "./streamer/StreamerList";
import StreamerTotalList from "./streamer/StreamerTotalList";
import StreamerInsert from "./streamer/StreamerInsert";
import StreamerEdit from "./streamer/StreamerEdit";
import StreamerDetail from "./streamer/StreamerDetail";
import StreamerDetailInfo from "./streamer/StreamerDetailInfo";
import StreamerTournaments from "./streamer/StreamerTournaments";
import StreamerCk from "./streamer/StreamerCk";
import StreamerWith from "./streamer/streamerWith/StreamerWith";

import TournamentList from "./tournament/TournamentList";
import TournamentDetail from "./tournament/TournamentDetail";
import TournamentMain from "./tournament/TournamentMain";
import TournamentTier from "./tournament/TournamentTier";
import TournamentInsert from "./tournament/TournamentInsert";
import TournamentEdit from "./tournament/TournamentEdit";

import TeamInsert from "./tournament/TeamInsert";
import TeamEdit from "./tournament/TeamEdit";
import CkList from "./ck/CkList";
import CkInsert from "./ck/CkInsert";
import CkMonthRanking from "./ck/CkMonthRanking";
import MemberJoin from "./member/MemberJoin";
import MemberLogin from "./member/MemberLogin";
import BoardWrite from "./board/BoardWrite";
import BoardList from "./board/BoardList";
import BoardDetail from "./board/BoardDetail";

import AdminMain from "./admin/AdminMain";
import AdminMemberPage from "./admin/AdminMemberPage";
import AdminVisitPage from "./admin/AdminVisitPage";
import AdminVisitUsePage from "./admin/AdminVisitUsePage";


import MyPageMain from "./mypage/MyPageMain";
import MyPageMember from "./mypage/MyPageMember";
import MyPageScrim from "./mypage/MyPageScrim";
import MyPageCk from "./mypage/MyPageCk";
import MyPageBookmark from "./mypage/MyPageBookmark";
import MyPageBookmarkTournament from "./mypage/MyPageBookmarkTournament";

export default function Content(){

return (<>

    {/* 전체 화면의 폭을 통제하기 위한 추가 코드 */}
    <div className="row">
        <div className="col-md-10 offset-md-1">
            {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
            <Routes>

                <Route path="/" element={<TournamentList />} />

                {/* 회원 */}
                <Route path="/member/join" element={<MemberJoin/>} />
                <Route path="/member/login" element={<MemberLogin/>} />

                {/* 마이페이지 */}
                <Route path="/mypage" element={<MyPageMain/>}>
                    <Route index element={<MyPageMember/>}/>
                    <Route path="member" element={<MyPageMember/>}/>
                    <Route path="scrim" element={<MyPageScrim/>}/>
                    <Route path="ck" element={<MyPageCk/>}/>
                    <Route path="bookmark" element={<MyPageBookmark/>}/>
                    <Route path="bookmarkTournament" element={<MyPageBookmarkTournament/>}/>
                </Route>


                {/* 관리자 */}
                <Route path="/admin" element={<AdminMain/>}>
                    <Route index element={<AdminMemberPage/>}/>
                    <Route path="member" element={<AdminMemberPage/>}/>
                    <Route path="visit" element={<AdminVisitPage/>}/>
                    <Route path="visit-use" element={<AdminVisitUsePage/>}/>
                </Route>

                {/* 스트리머 */}
                <Route path="/streamer" element={<StreamerList />} />
                <Route path="/streamerTotal" element={<StreamerTotalList />} />
                <Route path="/streamer/insert" element={<StreamerInsert />} />
                <Route path="/streamer/edit/:streamerId" element={<StreamerEdit />} />
                <Route path="/streamer/:streamerId" element={<StreamerDetail />}>
                    <Route index element={<StreamerDetailInfo />} />
                    <Route path="tournaments" element={<StreamerTournaments />} />
                    <Route path="ck-records" element={<StreamerCk />} />
                    <Route path="streamerWith" element={<StreamerWith />} />
                    <Route path="ck" element={<Navigate to="ck-records" replace />} />
                </Route>

                {/* 대회 */}
                <Route path="/tournament" element={<TournamentList />} />
                <Route path="/tournament/insert" element={<TournamentInsert/>}/>
                <Route path="/tournament/edit/:tournamentId" element={<TournamentEdit/>}/>
                <Route path="/tournament/:tournamentId" element={<TournamentDetail />}>
                    <Route index element={<TournamentMain />} />
                    <Route path="tier" element={<TournamentTier />} />
                </Route>

                {/* 팀 */}
                <Route path="/team/insert/:tournamentId" element={<TeamInsert/>}/>
                <Route path="/team/edit/:teamId" element={<TeamEdit/>}/>

                {/* CK */}
                <Route path="/ck" element={<CkList />}>
                    <Route index element={<Navigate to="ranking" replace />} />
                    <Route path="ranking" element={<CkMonthRanking />} />
                </Route>
                <Route path="/ck/insert" element={<CkInsert/>}/>

                {/* 게시판 */}
                <Route path="/board" element={<BoardList/>}/>
                <Route path="/board/write" element={<BoardWrite/>}/>
                <Route path="/board/:boardId" element={<BoardDetail/>}/>
            </Routes>
        </div>
    </div>
    </>)
}