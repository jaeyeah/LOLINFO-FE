import axios from "./axios";

/**
 * 방문자 UUID 기반 일일 방문 등록
 * - 최초 방문 시 UUID 생성 및 저장
 * - 동일 날짜 내 중복 방문 요청 방지
 * - API 요청 실패 시에도 화면 동작에 영향 없음
 */
export const trackDailyVisit = async () => {
  try {
    // 1) localStorage에서 sooplol_visitor_id 조회
    let visitorId = localStorage.getItem("sooplol_visitor_id");

    // 2) 없으면 crypto.randomUUID()로 생성 후 저장
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("sooplol_visitor_id", visitorId);
    }

    // 3) 오늘 날짜 문자열 YYYY-MM-DD 생성
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
    const visitDateKey = `sooplol_visit_${dateString}`;

    // 4) localStorage에서 sooplol_visit_YYYY-MM-DD 조회
    const hasVisitedToday = localStorage.getItem(visitDateKey);

    // 5) 이미 있으면 종료
    if (hasVisitedToday === "Y") {
      return;
    }

    // 6) 없으면 axios.post("/visit/", { visitorId }) 요청
    await axios.post("/visit/", { visitorId });

    // 7) 요청 성공 시 sooplol_visit_YYYY-MM-DD 값을 "Y"로 저장
    localStorage.setItem(visitDateKey, "Y");
  } catch (error) {
    // 8) 요청 실패 시 콘솔에만 에러 출력하고 화면 동작은 막지 않음
    console.error("방문 등록 실패:", error);
  }
};
