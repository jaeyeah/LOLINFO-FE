import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";


export default function TournamentDetail(){
    const {tournamentId} = useParams();
    const [tournament, setTournament] = useState({}); 

    const loadData = useCallback( async() => {
        try {
            const {data} = await axios.get(`/tournament/${tournamentId}`); 
            setTournament(data);
            console.log(data);
        } catch (error) {
            console.error("Error fetching tournament list:", error);
        }
    }, []); 

    useEffect(()=>{
        loadData();
    },[]);


    //render
    return(<>
        <h2>대회 상세</h2>
        <div> 대회 : {tournament.tournamentName}</div>
        

        
    </>)
}