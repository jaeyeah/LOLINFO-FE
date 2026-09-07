// 경기 날짜는 한국 날짜를 기준으로 선택한다. 최근 30일은 오늘 포함 30일이다.
export function getKoreaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getPresetCkPeriod(mode, now = new Date()) {
  if (mode === "all") return { startDate: "", endDate: "" };
  const endDate = getKoreaToday(now);
  if (mode === "month") return { startDate: `${endDate.slice(0, 7)}-01`, endDate };
  if (mode !== "30days") throw new Error("지원하지 않는 조회 기간입니다.");
  const start = new Date(`${endDate}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 29);
  return { startDate: start.toISOString().slice(0, 10), endDate };
}

export function validateCkPeriod(startDate, endDate) {
  if (!startDate || !endDate) return "시작일과 종료일을 모두 입력해주세요.";
  const valid = (value) => {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value < "0001-01-01") return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!valid(startDate) || !valid(endDate) || endDate === "9999-12-31") {
    return "유효한 날짜를 입력해주세요.";
  }
  if (startDate > endDate) return "시작일은 종료일보다 늦을 수 없습니다.";
  return "";
}

export function formatCkPeriod({ startDate, endDate }) {
  return startDate ? `${startDate} ~ ${endDate}` : "전체 기간";
}
