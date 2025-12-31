import { Route, Routes } from "react-router-dom";


import StreamerList from "./streamer/StreamerList";
import StreamerInsert from "./streamer/StreamerInsert";


export default function Content(){

return (<>

    {/* 전체 화면의 폭을 통제하기 위한 추가 코드 */}
    <div className="row">
        <div className="col-md-10 offset-md-1">
            {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
            <Routes>

                <Route path="/" element={<div>홈 화면</div>} />

                <Route path="/streamer" element={<StreamerList />} />
                <Route path="/streamer/insert" element={<StreamerInsert />} />

            </Routes>
        </div>
    </div>
    </>)
}