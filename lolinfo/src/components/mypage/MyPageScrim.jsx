import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../Pagination";


export default function MyPageScrim() {
    // 상태 관리
    
    const loginId = useAtomValue(loginIdState);
    const [scrimList, setScrimList] = useState ([]);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });

    const loadScrimList = useCallback(async () => {
        try {
        const { data } = await axios.get("/mypage/scrim", {
            params: { page },
        });
        setScrimList(data.list);
        setPageData(data.pageVO);
        console.log(data);
        } catch (error) {
        console.error(error);
        }
    }, [page]);

    useEffect(() => {
        loadScrimList();
    }, [loadScrimList]);

    const formatDate = (value) => {
        if (!value) return "";
        return value.substring(0, 10);
    };

    const formatHour = (hour) => {
        if (hour === null || hour === undefined) return "";
        return `${String(hour).padStart(2, "0")}시`;
    };

    // 스크림 수정
    // 수정을 위한 useState
    const [editScrimId, setEditScrimId] = useState(null);
    const [editScrimForm, setEditScrimForm] = useState({
        scrimDate: new Date().toISOString().split("T")[0],
        scrimRedScore: 0,
        scrimBlueScore: 0,
        scrimHour: 0,
    });
    const startEditScrim = useCallback((scrim) => {
        setEditScrimId(scrim.scrimId);

        setEditScrimForm({
            scrimId: scrim.scrimId,
            scrimDate: String(scrim.scrimDate).slice(0, 10),
            scrimHour: scrim.scrimHour ?? 0,
            scrimRedScore: scrim.scrimRedScore ?? 0,
            scrimBlueScore: scrim.scrimBlueScore ?? 0,
            scrimMatchType: scrim.scrimMatchType ?? "스크림",
        });
    }, []);
    // 스크림 수정 저장
    const updateScrim = async () => {
        try {
            await axios.patch("/scrim/", {
                scrimId: editScrimId,
                scrimDate: editScrimForm.scrimDate,
                scrimRedScore: Number(editScrimForm.scrimRedScore),
                scrimBlueScore: Number(editScrimForm.scrimBlueScore),
                scrimHour: Number(editScrimForm.scrimHour),
            });

            setEditScrimId(null);
            loadScrimList();
            onChanged?.();
        } catch (error) {
            console.error("스크림 수정 실패", error);
            alert("스크림 수정 중 오류가 발생했습니다.");
        }
    };

    // 스크림 삭제
    const deleteScrim = async (scrimId) => {
        if (!window.confirm("정말로 이 스크림 전적을 삭제하시겠습니까?")) {
            return;
        }
        try {
            await axios.delete(`/scrim/${scrimId}`);
            loadScrimList();
            onChanged?.();
        } catch (error) {
            console.error("스크림 삭제 실패", error);
            alert("스크림 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };
    


    return (
    <div className="container my-4">
      <h3 className="mb-4">내가 등록한 스크림</h3>

      {scrimList.length === 0 ? (
        <div className="text-center text-secondary py-5">
          등록한 스크림이 없습니다.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle text-center">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>날짜</th>
                <th style={{ width: "10%" }}>시간/구분</th>
                <th style={{ width: "20%" }}>대회</th>
                <th style={{ width: "40%" }}>대전 결과</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {scrimList.map((scrim) => (
                <tr key={scrim.scrimId} className={`border-secondary text-center
                                            ${scrim.scrimMatchType == "공식" ? "match-official"
                                            : scrim.scrimMatchType == "4강" ? "match-semifinal"
                                            : scrim.scrimMatchType == "결승" ? "match-final" : ""} `}>
                                        {editScrimId === scrim.scrimId ? (
                                            // 스크림 수정 모드
                                            <>
                                                <td>
                                                    <input type="date" className="form-control form-control-sm" value={editScrimForm.scrimDate}
                                                        onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimDate: e.target.value }))}
                                                    />
                                                </td>
                                                <td>
                                                    <input type="number" min="0" max="24" className="form-control form-control-sm" value={editScrimForm.scrimHour}
                                                        onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimHour: e.target.value }))}
                                                    />
                                                </td>
                                                {/* 대회 */}
                                                <td>{scrim.tournamentName}</td>
                                                
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                                        <span className="text-secondary">{scrim.scrimRedName}</span>
                                                        <input type="number" min="0" max="5" style={{ width: "60px" }} className="form-control form-control-sm" value={editScrimForm.scrimRedScore}
                                                            onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimRedScore: e.target.value }))}
                                                        />
                                                        <span>:</span>
                                                        <input type="number" min="0" max="5" style={{ width: "60px" }} className="form-control form-control-sm" value={editScrimForm.scrimBlueScore}
                                                            onChange={(e) => setEditScrimForm((prev) => ({ ...prev, scrimBlueScore: e.target.value }))}
                                                        />
                                                        <span className="text-secondary">{scrim.scrimBlueName}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <button className="btn btn-sm btn-success" onClick={updateScrim}>
                                                            저장
                                                        </button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => {setEditScrimId(null); }}>
                                                            취소
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            // 일반 모드 
                                            <>    
                                                <td>
                                                    {formatDate(scrim.scrimDate)}
                                                </td>
                                                <td>
                                                    {scrim.scrimMatchType == "스크림" ? (<>
                                                        <span>{scrim.scrimHour} </span>
                                                        <span className="text-small"> 시</span></>
                                                    ) : (
                                                        <span className={`badge ${ scrim.scrimMatchType === "공식" ? "badge-official"
                                                                                    : scrim.scrimMatchType === "4강" ? "badge-semifinal"
                                                                                    : scrim.scrimMatchType === "결승" ? "badge-final" : "" }`}>
                                                            {scrim.scrimMatchType}
                                                        </span>
                                                    )}
                                                </td>
                                                {/* 대회 */}
                                                <td>{scrim.tournamentName}</td>
                                                {/* 대전결과 td */}
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                                        {/* 점수가 0:0이면 예정으로 표시 */}
                                                        {scrim.scrimRedScore === 0 && scrim.scrimBlueScore === 0 ? (<>
                                                            <span>{scrim.scrimRedName}</span>
                                                            <span className="badge bg-dark">VS</span>
                                                            <span>{scrim.scrimBlueName}</span>
                                                        </>
                                                            
                                                        ) :(<>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span>{scrim.scrimRedName}</span>
                                                            </div>
                                                            <span className="mx-2 fw-bold" style={{ color: "#ffc107" }}>{scrim.scrimRedScore}:{scrim.scrimBlueScore}</span>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span>{scrim.scrimBlueName}</span>
                                                            </div>
                                                        </>)}
                                                    </div>
                                                </td>
                                                { scrim.scrimCreatedBy === loginId ? (
                                                    <td>
                                                        <button className="btn btn-sm btn-warning" onClick={() => startEditScrim(scrim)}>수정</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => deleteScrim(scrim.scrimId)}>삭제</button>
                                                    </td>
                                                    ):( <></>
                                                )}
                                        </>
                                        )}
                                    </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageData.totalPage > 1 && (
         <div className ="row mt-3">
            <div className="col-12 d-flex justify-content-center">
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
  );
}