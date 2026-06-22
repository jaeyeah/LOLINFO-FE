import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";





export default function StreamerWith(){
    const { streamer, streamerId } = useOutletContext();

    //로딩중 설정
    const [withCk, setWithCk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async()=>{
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get("/streamer/withCk", {
                params: { streamerId }
            });
            setWithCk(data);
            console.log(data)
            } catch (error) {
            console.error("Error fetching streamer detail:", error);
            setError("스트리머 정보를 불러오지 못했습니다.");
            }
            finally {
            setLoading(false);
            }
        }, [streamerId]);

    useEffect(()=>{
        loadData();
    },[]);




return (<>
    
    
    
    <div>임시 페이지입니다</div>
    {withCk.map(item => (
        <div key={item.partnerNo}>
            {item.partnerName}
            {item.playCount}전
            {item.winCount}승 
            {item.liseCount}패
        </div>
    ))}
    
    
    
</>)
}