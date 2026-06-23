import { useOutletContext } from "react-router-dom";
import WithCk from "./WithCk";
import WithTournament from "./WithTournament";
import { useCallback, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

export default function StreamerWith() {
    const { streamerId } = useOutletContext();
    //검색어 state
    const [keyword, setKeyword] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    //[입력창 제어 및 검색이동]
    const handleSearch = useCallback(() => {
        const value = keyword.trim();
        if (value.length === 0) {
            alert("검색어를 입력해주세요.");
            return; }
        setSearchKeyword(value);
        setKeyword("");
    }, [keyword]);

    // 기능사용 증가
    const increaseData = useCallback(async () => {
        try {
        await axios.post("/streamer/teammateVisit");
        } catch (error) {
        console.error(error);
        } 
    }, []);

    useEffect(() => {
        if (streamerId) {
            increaseData();
        }
    }, [streamerId]);

return (<>
{/* 검색창 */}
<div className="row mt-3 justify-content-center">
    <div className="col-12 col-xl-8">
        <div className="streamer-control-panel">
            <div className="search-wrapper flex-grow-1">
                <div className="input-group streamer-search-group">
                    <input
                        type="text"
                        className="search form-control search-bar text-light"
                        value={keyword}
                        placeholder="스트리머 검색"
                        onChange={e => setKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    />
                    <button className="search btn btn-success" onClick={handleSearch}>
                        <FaSearch className="fs-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>


<div className="mt-3 row">
    {/* 같이 CK 참여했던 스트리머 목록 */}
    <WithCk streamerId={streamerId} keyword={searchKeyword} /> 
    {/* 같이 대회 참여했던 스트리머 목록 */}
    <WithTournament streamerId={streamerId} keyword={searchKeyword} />
</div>
</>)
}