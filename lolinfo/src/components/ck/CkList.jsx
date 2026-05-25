import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Pagination from "../Pagination";

export default function CkList() {
  const [ckList, setCkList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({
    page: 1,
    size: 10,
    totalCount: 0,
    totalPage: 0,
    blockStart: 1,
    blockFinish: 1,
    prev: false,
    next: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCkList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("/ck/", { params: { page } });
      setCkList(data.list ?? []);
      setPageData(data.pageVO ?? {
        page,
        size: 10,
        totalCount: 0,
        totalPage: 0,
        blockStart: 1,
        blockFinish: 1,
        prev: false,
        next: false,
      });
    } catch (err) {
      console.error("CK 목록 로드 실패", err);
      setError("CK 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadCkList();
  }, [loadCkList]);

  const formatDate = (value) => {
    if (!value) return "날짜 없음";
    try {
      return new Date(value).toISOString().split("T")[0];
    } catch {
      return "날짜 없음";
    }
  };

  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <div className="card bg-dark border-secondary text-white p-3">
            <h2 className="mb-1">CK 전체 목록</h2>
            <p className="mb-0 text-secondary">
              CK 목록은 최소 데이터만 조회하며 팀원 상세 정보는 별도 API로 분리됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12">
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-light" role="status" />
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && ckList.length === 0 && (
            <div className="card bg-dark border-secondary text-white p-4 text-center">
              등록된 CK가 없습니다.
            </div>
          )}

          {!loading && !error && ckList.length > 0 && (
            <div className="card bg-dark border-secondary text-white mb-3">
              <div className="table-responsive">
                <table className="table table-dark table-striped mb-0 align-middle">
                  <thead>
                    <tr>
                      <th scope="col">CK 날짜</th>
                      <th scope="col">CK 메모</th>
                      <th scope="col">팀원 보기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ckList.map((ck) => (
                      <tr key={ck.ckId} className="border-secondary">
                        <td>{formatDate(ck.ckDate)}</td>
                        <td>{ck.ckMemo || "메모 없음"}</td>
                        <td>
                          <button type="button" className="btn btn-outline-light btn-sm" disabled>
                            팀원 보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="row mt-2">
              <div className="col-12 d-flex flex-column align-items-center gap-2">
                <div className="text-white">
                  현재 페이지: <strong>{pageData.page}</strong> / 전체 페이지: <strong>{pageData.totalPage}</strong>
                </div>
                <Pagination
                  page={page}
                  totalPage={pageData.totalPage}
                  blockStart={pageData.blockStart}
                  blockFinish={pageData.blockFinish}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
