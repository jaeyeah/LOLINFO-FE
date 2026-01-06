import { useMemo, useCallback } from "react";
import "./Pagination.css"

//페이지네이션 별도의 컴포넌트로 분리
export default function Pagination({
  page,
  totalPage,
  blockStart,
  blockFinish,
  onPageChange
}) {

  const pageNumbers = useMemo(() => {
    if (!totalPage) return [];
    return Array.from(
      { length: blockFinish - blockStart + 1 },
      (_, i) => blockStart + i
    );
  }, [blockStart, blockFinish, totalPage]);

  const movePrevBlock = useCallback(() => {
    onPageChange(Math.max(1, blockStart - 1));
  }, [blockStart, onPageChange]);

  const moveNextBlock = useCallback(() => {
    onPageChange(Math.min(totalPage, blockFinish + 1));
  }, [blockFinish, totalPage, onPageChange]);

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination">

        <li className={`page-item ${blockStart === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={movePrevBlock}>◀</button>
        </li>

        {pageNumbers.map(pageNum => (
          <li
            key={pageNum}
            className={`page-item ${page === pageNum ? "active" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          </li>
        ))}

        <li className={`page-item ${blockFinish >= totalPage ? "disabled" : ""}`}>
          <button className="page-link" onClick={moveNextBlock}>▶</button>
        </li>

      </ul>
    </nav>
  );
}