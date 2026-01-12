import { Route, Routes } from "react-router-dom";

import StreamerList from "./streamer/StreamerList";
import StreamerTotalList from "./streamer/StreamerTotalList";
import StreamerInsert from "./streamer/StreamerInsert";
import StreamerEdit from "./streamer/StreamerEdit";
import StreamerDetail from "./streamer/StreamerDetail";

import TournamentList from "./tournament/TournamentList";
import TournamentDetail from "./tournament/TournamentDetail";
import TournamentInsert from "./tournament/TournamentInsert";
import TournamentEdit from "./tournament/TournamentEdit";

import TeamInsert from "./tournament/TeamInsert";
import TeamEdit from "./tournament/TeamEdit";
import MemberJoin from "./member/MemberJoin";


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


                {/* 스트리머 */}
                <Route path="/streamer" element={<StreamerList />} />
                <Route path="/streamerTotal" element={<StreamerTotalList />} />
                <Route path="/streamer/insert" element={<StreamerInsert />} />
                <Route path="/streamer/edit/:streamerId" element={<StreamerEdit />} />
                <Route path="/streamer/:streamerId" element={<StreamerDetail />} /> 

                {/* 대회 */}
                <Route path="/tournament" element={<TournamentList />} />
                <Route path="/tournament/insert" element={<TournamentInsert/>}/>
                <Route path="/tournament/edit/:tournamentId" element={<TournamentEdit/>}/>
                <Route path="/tournament/:tournamentId" element={<TournamentDetail />} />

                {/* 팀 */}
                <Route path="/team/insert/:tournamentId" element={<TeamInsert/>}/>
                <Route path="/team/edit/:teamId" element={<TeamEdit/>}/>
            
            </Routes>
        </div>
    </div>
    </>)
}