import test from "node:test";
import assert from "node:assert/strict";
import { getKoreaToday, getPresetCkPeriod, validateCkPeriod, formatCkPeriod } from "../src/utils/ckPeriod.js";

test("한국 자정에 날짜가 바뀐다", () => {
  assert.equal(getKoreaToday(new Date("2026-09-06T14:59:59Z")), "2026-09-06");
  assert.equal(getKoreaToday(new Date("2026-09-06T15:00:00Z")), "2026-09-07");
});

test("이번 달은 한국 날짜의 1일부터 오늘까지다", () => {
  assert.deepEqual(getPresetCkPeriod("month", new Date("2026-08-31T15:00:00Z")), {
    startDate: "2026-09-01", endDate: "2026-09-01",
  });
});

test("최근 30일은 오늘을 포함하고 연도 경계와 윤년을 처리한다", () => {
  assert.deepEqual(getPresetCkPeriod("30days", new Date("2026-01-01T03:00:00Z")), {
    startDate: "2025-12-03", endDate: "2026-01-01",
  });
  assert.deepEqual(getPresetCkPeriod("30days", new Date("2024-03-01T03:00:00Z")), {
    startDate: "2024-02-01", endDate: "2024-03-01",
  });
});

test("전체 기간은 날짜 조건이 없다", () => {
  assert.deepEqual(getPresetCkPeriod("all"), { startDate: "", endDate: "" });
  assert.equal(formatCkPeriod(getPresetCkPeriod("all")), "전체 기간");
});

test("하루 조회와 윤년 날짜를 허용하고 역순·누락·잘못된 날짜를 거절한다", () => {
  assert.equal(validateCkPeriod("2026-09-07", "2026-09-07"), "");
  assert.equal(validateCkPeriod("2024-02-29", "2024-03-01"), "");
  for (const [start, end] of [
    ["", "2026-09-07"], ["2026-09-07", ""],
    ["2026-09-08", "2026-09-07"], ["2026-02-29", "2026-03-01"],
    ["2026-04-31", "2026-05-01"], ["2026-9-01", "2026-09-07"],
    ["0000-01-01", "2026-09-07"], ["2026-09-07", "9999-12-31"],
  ]) assert.notEqual(validateCkPeriod(start, end), "");
});
