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
            <div className="home-ck-schedule-heading">
                <div>
                    <p className="home-ck-schedule-eyebrow">UP NEXT</p>
                    {/* <h2 id="home-ck-schedule-title">예정 CK</h2> */}
                    <p className="home-ck-schedule-intro">곧 시작될 CK 일정을 미리 확인해보세요.</p>
                </div>
                <span className="home-ck-schedule-count" aria-label={`${schedules.length}개 일정`}>{schedules.length} 일정</span>
            </div>
            {status === "loading" && <p role="status">예정 CK를 불러오는 중입니다.</p>}
            {status === "error" && <p role="alert">예정 CK를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</p>}
            {status === "ready" && schedules.length === 0 && <p>현재 등록된 예정 CK가 없습니다.</p>}
            {status === "ready" && schedules.length > 0 && (
                <div className="home-ck-schedule-grid">
                    {schedules.map((item) => {
                        const url = getScheduleUrl(item.ckUrl);
                        const preview = (item.boardContent || "")
                            .replace(/<br\s*\/?>(\r?\n)?/gi, "\n")
                            .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
                            .replace(/<[^>]*>/g, "")
                            .replace(/[ \t]+/g, " ")
                            .replace(/\n{3,}/g, "\n\n")
                            .trim();
                        return (
                            <article className="home-ck-schedule-card" key={item.boardId}>
                                <div className="home-ck-schedule-card-top">
                                    <span className="home-ck-schedule-badge">CK SCHEDULE</span>
                                    <time dateTime={item.ckDate}>{formatScheduleDate(item.ckDate)}</time>
                                </div>
                                <h3 className="fw-bold home-ck-schedule-badge"><Link to={`/board/${item.boardId}`}>{item.boardTitle}</Link></h3>
                                <p className="home-ck-schedule-preview">{preview || "등록된 일정 내용을 확인해보세요."}</p>
                                <div className="home-ck-schedule-links">
                                    <Link to={`/board/${item.boardId}`}>게시글 보기 <span aria-hidden="true">→</span></Link>
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
