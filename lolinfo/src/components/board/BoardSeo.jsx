import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

// React 19의 메타태그 호이스팅은 index.html의 description을 교체하지 않는다.
// 게시판을 표시하는 동안만 기본 description을 빼고, 다른 화면으로 나가면 복구한다.
export default function BoardSeo({ children }) {
    useEffect(() => {
        const fallback = document.getElementById("site-default-description");
        if (!fallback) return;
        fallback.remove();
        return () => document.head.appendChild(fallback);
    }, []);
    return <Helmet>{children}</Helmet>;
}
