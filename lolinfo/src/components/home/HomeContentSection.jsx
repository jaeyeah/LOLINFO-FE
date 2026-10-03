import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import "./HomeContentSection.css";

const CONTENT_CATEGORIES = ["blog", "정보"];
const POSTS_PER_CATEGORY = 3;

function toTimestamp(value) {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date).replace(/\. /g, ".").replace(/\.$/, "");
}

function getExcerpt(content) {
    return (content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function selectContentBoards(boardList) {
    return CONTENT_CATEGORIES.flatMap((category) => boardList
        .filter((board) => board.boardCategory === category)
        .sort((a, b) => toTimestamp(b.boardWtime) - toTimestamp(a.boardWtime))
        .slice(0, POSTS_PER_CATEGORY));
}

function ContentSkeleton() {
    return (
        <div className="home-content-grid" aria-label="게시글을 불러오는 중입니다.">
            {Array.from({ length: 6 }, (_, index) => (
                <div className="home-content-card home-content-skeleton" key={index} aria-hidden="true">
                    <span className="home-content-skeleton-line home-content-skeleton-category" />
                    <span className="home-content-skeleton-line home-content-skeleton-title" />
                    <span className="home-content-skeleton-line" />
                    <span className="home-content-skeleton-line home-content-skeleton-short" />
                    <span className="home-content-skeleton-line home-content-skeleton-date" />
                </div>
            ))}
        </div>
    );
}

export default function HomeContentSection() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchPosts() {
            try {
                const { data } = await axios.get("/board/", { signal: controller.signal });
                const boardList = Array.isArray(data) ? data : data?.list || [];
                const selectedBoards = selectContentBoards(boardList);

                const detailedPosts = await Promise.all(selectedBoards.map(async (board) => {
                    try {
                        const { data: detail } = await axios.get(`/board/${board.boardId}`, { signal: controller.signal });
                        return { ...board, ...detail };
                    } catch (error) {
                        if (!controller.signal.aborted) {
                            console.error("홈 콘텐츠 상세 조회 오류:", error);
                        }
                        return board;
                    }
                }));

                if (!controller.signal.aborted) {
                    setPosts(detailedPosts);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("홈 콘텐츠 목록 조회 오류:", error);
                setHasError(true);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        fetchPosts();
        return () => controller.abort();
    }, []);

    return (
        <section className="home-content-section" aria-labelledby="home-content-title">
            <div className="home-content-heading">
                <div>
                    <p className="home-eyebrow">SOOPLOL STORIES</p>
                    <h2 id="home-content-title">SOOPLOL 이야기</h2>
                    <p>CK와 멸망전, SOOP LoL 콘텐츠의 다양한 이야기를 만나보세요.</p>
                </div>
                <Link to="/board" className="home-content-all-link">전체 이야기 보기 <span aria-hidden="true">→</span></Link>
            </div>

            {isLoading && <ContentSkeleton />}
            {!isLoading && hasError && (
                <p className="home-content-feedback" role="alert">이야기를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            )}
            {!isLoading && !hasError && posts.length === 0 && (
                <p className="home-content-feedback">등록된 이야기가 없습니다.</p>
            )}
            {!isLoading && !hasError && posts.length > 0 && (
                <div className="home-content-grid">
                    {posts.map((post) => (
                        <article className="home-content-card" key={post.boardId}>
                            <span className="home-content-category">{post.boardCategory === "blog" ? "멸망전·CK" : "월간 기록"}</span>
                            <h3>
                                <Link to={`/board/${post.boardId}`} state={{ from: "/board" }}>
                                    {post.boardTitle}
                                </Link>
                            </h3>
                            <p className="home-content-excerpt">{getExcerpt(post.boardContent) || "SOOPLOL의 새로운 이야기를 자세히 확인해보세요."}</p>
                            <time dateTime={post.boardWtime}>{formatDate(post.boardWtime)}</time>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
