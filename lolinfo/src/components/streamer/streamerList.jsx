import axios from "axios";
import { useCallback, useEffect, useState } from "react";


export default function StreamerList() {

    const [streamerList, setStreamerList] = useState({});

    const loadData = useCallback( async() => {
        try {
            const response = await axios.get("/streamer/");
            console.log(response);
            //setStreamerList(response.data);
        } catch (error) {
            console.error("Error fetching streamer list:", error);
        }
    }, []);

    useEffect(()=>{
        loadData();
    },[]);

    //render
    return (<>
    
    임시페이지
    
    
    </>)

}