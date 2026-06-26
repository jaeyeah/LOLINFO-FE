import { useCallback, useEffect, useState } from "react";





export default function MyPageCk(){
//상태 관리
const [ckList, setCkList] = useState([]);
const [page, setPage] = useState(1);
const [pageData, setPage] = useState({
    page : 1, size : 10, totalCount : 0, totalPage : 0 , blockStart : 1, blockFinish : 1
});

const loadCkList = useCallback(async () =>{
    try{

    } catch(error){
        console.error(error);
    }

},[page]); 

useEffect(()=>{
    loadCkList();
},[loadCkList])







return (
<div className="container my-4">
    <h3 className="mb-4">내가 등록한 CK</h3>



</div>
); 
}