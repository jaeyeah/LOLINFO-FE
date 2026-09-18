import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { getKoreaToday } from "../../utils/ckPeriod";
import "./CkCalendar.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const LEVELS = ["0건", "1건", "2~3건", "4~6건", "7건 이상"];
const levelFor = (count) => count >= 7 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : count > 0 ? 1 : 0;

export default function CkCalendar({ refreshKey = 0 }) {
   const today = getKoreaToday();
   const [month, setMonth] = useState(() => today.slice(0, 7));
   const [retry, setRetry] = useState(0);
   const [result, setResult] = useState({ month: "", counts: {}, loading: true, error: false });
   const [year, monthNumber] = month.split("-").map(Number);
   const firstDay = new Date(`${month}-01T00:00:00Z`).getUTCDay();
   const lastDate = new Date(`${month}-01T00:00:00Z`);
   lastDate.setUTCMonth(lastDate.getUTCMonth() + 1, 0);
   const days = lastDate.getUTCDate();
   const loading = result.loading || result.month !== month;
   const counts = result.month === month ? result.counts : {};
   const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

   useEffect(() => {
      const controller = new AbortController();
      setResult({ month, counts: {}, loading: true, error: false });
      const load = async () => {
         try {
            const { data } = await axios.get("/ck/dailyCount", {
               params: { month }, signal: controller.signal,
            });
            if (controller.signal.aborted) return;
            if (!Array.isArray(data)) throw new Error("Invalid calendar response");
            const nextCounts = {};
            for (const item of data) {
               if (typeof item.ckDate !== "string" || !item.ckDate.startsWith(`${month}-`)
                  || !/^\d{4}-\d{2}-\d{2}$/.test(item.ckDate)
                  || Number(item.ckDate.slice(8)) < 1 || Number(item.ckDate.slice(8)) > days
                  || !Number.isInteger(item.ckCount) || item.ckCount < 0) {
                  throw new Error("Invalid calendar day");
               }
               nextCounts[item.ckDate] = item.ckCount;
            }
            setResult({ month, counts: nextCounts, loading: false, error: false });
         } catch (err) {
            if (controller.signal.aborted || axios.isCancel(err)) return;
            setResult({ month, counts: {}, loading: false, error: true });
         }
      };
      load();
      return () => controller.abort();
   }, [month, days, refreshKey, retry]);

   const moveMonth = (offset) => {
      const date = new Date(`${month}-01T00:00:00Z`);
      date.setUTCMonth(date.getUTCMonth() + offset);
      setMonth(date.toISOString().slice(0, 7));
   };

   return (
      <section className="ck-calendar mb-3" aria-labelledby="ck-calendar-title" aria-busy={loading}>
         <div className="ck-calendar-header">
            <h5 id="ck-calendar-title">CK 캘린더</h5>
            <button type="button" className="ck-calendar-today" onClick={() => setMonth(today.slice(0, 7))}>이번 달</button>
         </div>
         <div className="ck-calendar-navigation">
            <button type="button" aria-label="이전 달" disabled={month === "0001-01"} onClick={() => moveMonth(-1)}>‹</button>
            <strong aria-live="polite">{year}년 {monthNumber}월</strong>
            <button type="button" aria-label="다음 달" disabled={month === "9998-12"} onClick={() => moveMonth(1)}>›</button>
         </div>
         {loading ? <div className="ck-calendar-status" role="status">캘린더를 불러오는 중입니다...</div>
            : result.error ? <div className="ck-calendar-status" role="alert">
               <span>캘린더를 불러오지 못했습니다.</span>
               <button type="button" onClick={() => setRetry((value) => value + 1)}>다시 시도</button>
            </div> : <>
               <div className="ck-calendar-grid" role="list" aria-label={`${year}년 ${monthNumber}월 날짜별 CK 건수`}>
                  {WEEKDAYS.map((day) => <span className="ck-calendar-weekday" key={day} aria-hidden="true">{day}</span>)}
                  {Array.from({ length: firstDay }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
                  {Array.from({ length: days }, (_, index) => {
                     const day = index + 1;
                     const date = `${month}-${String(day).padStart(2, "0")}`;
                     const count = counts[date] ?? 0;
                     return <div key={date} role="listitem" title={`${date}: CK ${count}건`}
                        aria-label={`${monthNumber}월 ${day}일 CK ${count}건${date === today ? ", 오늘" : ""}`}
                        aria-current={date === today ? "date" : undefined}
                        className={`ck-calendar-day ck-calendar-level-${levelFor(count)}${date === today ? " ck-calendar-is-today" : ""}`}>
                        <span>{day}</span><small>{count > 0 ? `${count}건` : ""}</small>
                     </div>;
                  })}
               </div>
               <p className="ck-calendar-summary">{total > 0 ? `이번 달 ${total.toLocaleString()}건 · ${Object.keys(counts).filter((date) => counts[date] > 0).length}일 활동` : "해당 월에 등록된 CK가 없습니다."}</p>
            </>}
         <div className="ck-calendar-legend" aria-label="경기 수별 색상 범례">
            {LEVELS.map((label, level) => <span key={label}><i className={`ck-calendar-level-${level}`} />{label}</span>)}
         </div>
      </section>
   );
}
