import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";


export default function MyPageScrim() {
    // 상태 관리
    
    const loginId = useAtomValue(loginIdState);
    const [bookmarkList, setBookmarkList] = useState ([]);


    const loadBookmarkList = useCallback(async () => {
        try {
        const { data } = await axios.get("/bookmark/");
        setBookmarkList(data);
        console.log(data);
        } catch (error) {
        console.error(error);
        }
    }, []);

    useEffect(() => {
        loadBookmarkList();
    }, [loadBookmarkList]);


    return (
    <>
    {/* {bookmarkList.map((bookmark)=>(
        <div key={`${bookmark.bookmarkType}-${bookmark.bookmarkTarget}`}>
            {bookmark.bookmarkMember}
            {bookmark.bookmarkType}
            {bookmark.bookmarkTarget}
        </div>
    ))} */}
    
    </>
  );
}