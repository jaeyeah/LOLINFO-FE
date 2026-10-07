import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import { formatScheduleDate, getScheduleUrl } from "../../utils/ckSchedule";
import "./HomeCkSchedule.css";

export default function HomeCkSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const controller = new AbortController();
        axios.get("/ck/schedule/home", { signal: controller.signal }).then(({ data }) => {
            if (controller.signal.aborted) return;
            if (!Array.isArray(data)) throw new Error("예정 CK 응답 형식 오류");
            setSchedules(data);
            setStatus("ready");
        }).catch(() => {
            if (!controller.signal.aborted) setStatus("error");
        });
        return () => controller.abort();
    }, []);

    return (
        <section className="home-ck-schedule" aria-labelledby="home-ck-schedule-title">
            <h2 id="home-ck-schedule-title">예정 CK</h2>
            {status === "loading" && <p role="status">예정 CK를 불러오는 중입니다.</p>}
            {status === "error" && <p role="alert">예정 CK를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</p>}
            {status === "ready" && schedules.length === 0 && <p>현재 등록된 예정 CK가 없습니다.</p>}
            {status === "ready" && schedules.length > 0 && (
                <div className="home-ck-schedule-grid">
                    {schedules.map((item) => {
                        const url = getScheduleUrl(item.ckUrl);
                        const preview = (item.boardContent || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                        return (
                            <article className="home-ck-schedule-card" key={item.boardId}>
                                <time dateTime={item.ckDate}>{formatScheduleDate(item.ckDate)}</time>
                                <h3><Link to={`/board/${item.boardId}`}>{item.boardTitle}</Link></h3>
                                <p className="home-ck-schedule-preview">{preview}</p>
                                <div className="home-ck-schedule-links">
                                    <Link to={`/board/${item.boardId}`}>게시글 보기</Link>
                                    {url && <a href={url} target="_blank" rel="noopener noreferrer">관련 링크</a>}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
