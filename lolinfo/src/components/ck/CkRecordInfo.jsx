import { useEffect, useId, useRef, useState } from "react";
import { FaInfoCircle, FaTimes } from "react-icons/fa";
import "./CkRecordInfo.css";

export default function CkRecordInfo({ personal = false }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const dismissEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open]);

  return (
    <div className="ck-record-info" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className="ck-record-info-toggle"
        aria-label="CK 기록 집계 기준"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <FaInfoCircle aria-hidden="true" />
      </button>
      <section id={id} className="ck-record-info-note" hidden={!open}
        aria-labelledby={`${id}-title`}>
        <div className="ck-record-info-header">
          <strong id={`${id}-title`}>CK 기록 집계 기준</strong>
          <button type="button" className="ck-record-info-close" aria-label="집계 기준 닫기"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}>
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        <ul>
          <li>SOOPLOL에 등록된 CK 기록을 기준으로 하며, 실제 진행된 경기 중 누락된 기록이 있을 수 있습니다.</li>
          <li>CK 건수는 등록된 CK 단위로 집계하며, 개별 세트 수와는 다릅니다.</li>
          <li>세트별 교체 인원이 있는 CK는 현재 전적 등록 대상에서 제외됩니다.</li>
          {personal ? (
            <>
              <li>전적·포지션별 통계·맞라인 상대전적은 선택한 기간에 해당하는 기록을 기준으로 표시합니다.</li>
              <li>승률은 승리 수 ÷ (승리 수 + 패배 수) × 100으로 계산합니다.</li>
              <li>현재 연승·연패와 최고 연승·최다 연패는 기간 필터와 별도로 조회되는 기록입니다.</li>
            </>
          ) : (
            <li>팀원 보기를 누르면 해당 CK의 참가자와 팀 구성을 확인할 수 있습니다.</li>
          )}
        </ul>
        <p>기록 수정이나 누락 경기 추가에 따라 통계가 달라질 수 있습니다. 오류·누락은 제보 기능으로 알려주세요.</p>
      </section>
    </div>
  );
}
