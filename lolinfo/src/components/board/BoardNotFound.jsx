import BoardSeo from "./BoardSeo";
import { Link } from "react-router-dom";

export default function BoardNotFound() {
    return <section className="board-list-container">
        <BoardSeo>
            <title>게시판 페이지를 찾을 수 없습니다 | SOOPLOL</title>
            <meta name="robots" content="noindex,follow" />
        </BoardSeo>
        <h1>게시판 페이지를 찾을 수 없습니다</h1>
        <p>주소가 올바른지 확인하거나 게시판에서 다른 콘텐츠를 살펴보세요.</p>
        <Link to="/board">게시판 전체보기</Link>
    </section>;
}
