import test from "node:test";
import assert from "node:assert/strict";
import { createBoardRequest, validateSchedule, toDatetimeLocal, formatScheduleDate, getScheduleUrl } from "../src/utils/ckSchedule.js";

test("일반 글 등록과 CK → 일반 전환은 남은 입력값과 무관하게 schedule=null", () => {
    const schedule = { ckDate: "2026-10-10T20:00", ckUrl: "https://example.com" };
    for (const board of [{ boardCategory: "자유" }, { boardId: 101, boardCategory: "정보" }]) {
        assert.deepEqual(createBoardRequest(board, schedule), { board, schedule: null });
        assert.equal(validateSchedule(board.boardCategory, { ckDate: "", ckUrl: "invalid" }), "");
    }
});

test("CK 등록·수정 및 일반 → CK 전환 요청의 ID와 선택 링크", () => {
    const schedule = { ckDate: "2026-10-10T20:00", ckUrl: "  " };
    assert.deepEqual(createBoardRequest({ boardCategory: "CK예정" }, schedule).schedule,
        { ckDate: "2026-10-10T20:00:00", ckUrl: null });
    assert.deepEqual(createBoardRequest({ boardId: 101, boardCategory: "CK예정" }, { ...schedule, ckUrl: "https://example.com" }).schedule,
        { boardId: 101, ckDate: "2026-10-10T20:00:00", ckUrl: "https://example.com" });
});

test("CK 필수 날짜 및 외부 링크 검증", () => {
    assert.match(validateSchedule("CK예정", { ckDate: "", ckUrl: "" }), /예정 일시/);
    assert.match(validateSchedule("CK예정", { ckDate: "invalid", ckUrl: "" }), /확인/);
    for (const url of ["javascript:alert(1)", "data:text/html,test", "/relative", "invalid"]) {
        assert.equal(getScheduleUrl(url), "");
        assert.match(validateSchedule("CK예정", { ckDate: "2026-10-10T20:00", ckUrl: url }), /http/);
    }
    assert.equal(validateSchedule("CK예정", { ckDate: "2026-10-10T20:00", ckUrl: "" }), "");
});

test("서버 로컬 시간을 UTC 변환 없이 입력·표시", () => {
    assert.equal(toDatetimeLocal("2026-10-10T20:00:39"), "2026-10-10T20:00");
    assert.equal(toDatetimeLocal(null), "");
    assert.equal(formatScheduleDate("2026-10-10T20:00:00"), "10.10 (토) 20:00");
    assert.equal(formatScheduleDate("invalid"), "일정 확인 필요");
});
