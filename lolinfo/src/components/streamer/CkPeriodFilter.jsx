import { useState } from "react";
import { formatCkPeriod, getPresetCkPeriod, validateCkPeriod } from "../../utils/ckPeriod";

export default function CkPeriodFilter({ period, onApply }) {
  const [mode, setMode] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const selectMode = (next) => {
    setMode(next);
    setError("");
    if (next === "custom") {
      const draft = period.startDate ? period : getPresetCkPeriod("month");
      setStartDate(draft.startDate);
      setEndDate(draft.endDate);
      return;
    }
    onApply(getPresetCkPeriod(next));
  };

  const applyCustom = (event) => {
    event.preventDefault();
    const message = validateCkPeriod(startDate, endDate);
    setError(message);
    if (!message) onApply({ startDate, endDate });
  };

  return (
    <section className="card bg-dark border-secondary text-white p-3 mt-3" aria-label="CK 조회 기간">
      <div className="d-flex flex-wrap gap-2">
        {[["all", "전체"], ["month", "이번 달"], ["30days", "최근 30일"], ["custom", "기간 지정"]].map(([value, label]) => (
          <button key={value} type="button" aria-pressed={mode === value}
            className={`btn btn-sm ${mode === value ? "btn-primary" : "btn-outline-light"}`}
            onClick={() => selectMode(value)}>{label}</button>
        ))}
      </div>
      {mode === "custom" && (
        <form className="row g-2 align-items-end mt-1" onSubmit={applyCustom}>
          <div className="col-12 col-sm-5">
            <label htmlFor="ck-start-date" className="form-label">시작일</label>
            <input id="ck-start-date" type="date" className="form-control" required
              min="0001-01-01" max={endDate || "9999-12-30"} value={startDate}
              onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="col-12 col-sm-5">
            <label htmlFor="ck-end-date" className="form-label">종료일</label>
            <input id="ck-end-date" type="date" className="form-control" required
              min={startDate || "0001-01-01"} max="9999-12-30" value={endDate}
              onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="col-12 col-sm-2"><button type="submit" className="btn btn-primary w-100">조회</button></div>
          {error && <p className="text-danger mb-0" role="alert">{error}</p>}
        </form>
      )}
      <p className="small text-secondary mt-2 mb-0" aria-live="polite">
        적용 기간: {formatCkPeriod(period)} · 경기 날짜 기준 · 시작일과 종료일 포함
      </p>
    </section>
  );
}
