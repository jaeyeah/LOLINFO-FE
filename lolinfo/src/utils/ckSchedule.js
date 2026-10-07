export const CK_SCHEDULE_CATEGORY = "CK 예정";

export function toDatetimeLocal(value) {
    return typeof value === "string" ? value.slice(0, 16) : "";
}

export function getScheduleUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}

export function validateSchedule(category, schedule) {
    if (category !== CK_SCHEDULE_CATEGORY) return "";
    if (!schedule.ckDate) return "CK 예정일시를 입력해주세요.";
    if (Number.isNaN(new Date(schedule.ckDate).getTime())) return "CK 예정일시를 확인해주세요.";
    if (schedule.ckUrl.trim() && !getScheduleUrl(schedule.ckUrl.trim())) {
        return "관련 링크는 http 또는 https URL로 입력해주세요.";
    }
    return "";
}

export function createBoardRequest(board, schedule) {
    return {
        board,
        schedule: board.boardCategory === CK_SCHEDULE_CATEGORY ? {
            ...(board.boardId != null ? { boardId: board.boardId } : {}),
            ckDate: schedule.ckDate.length === 16 ? `${schedule.ckDate}:00` : schedule.ckDate,
            ckUrl: schedule.ckUrl.trim() || null,
        } : null,
    };
}

export function formatScheduleDate(value) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return "일정 확인 필요";
    const pad = (number) => String(number).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} (${"일월화수목금토"[date.getDay()]}) ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
