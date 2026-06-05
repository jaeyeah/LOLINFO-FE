import { useAtomValue } from "jotai";
import { accessTokenState, loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Board.css";

const CATEGORIES = [
    { value: "자유", label: "자유" },
    { value: "제보", label: "제보" },
    { value: "신고", label: "신고" },
];

export default function BoardWrite() {
    const accessToken = useAtomValue(accessTokenState);
    const loginId = useAtomValue(loginIdState);
    const navigate = useNavigate();


    // Form state
    const [form, setForm] = useState({
        boardCategory: "자유",
        boardTitle: "",
        boardContent: "",
    });

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // 로그인 체크
    useEffect(() => {
        if (!accessToken || accessToken.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "로그인이 필요합니다",
                text: "게시글 작성은 로그인한 회원만 가능합니다.",
                confirmButtonText: "확인",
                confirmButtonColor: "#ea8685",
            }).then(() => {
                navigate("/member/login");
            });
        }
    }, [accessToken, navigate]);

    // Form change handler
    const handleChangeForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // Form submit handler
    const handleSubmitForm = useCallback(
        async (e) => {
            e.preventDefault();

            // Validation
            if (!form.boardTitle.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "제목을 입력해주세요",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#ea8685",
                });
                return;
            }

            if (!form.boardContent.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "내용을 입력해주세요",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#ea8685",
                });
                return;
            }

            setIsLoading(true);

            try {
                const requestData = {
                    boardCategory: form.boardCategory,
                    boardTitle: form.boardTitle,
                    boardContent: form.boardContent,
                };

                const response = await axios.post("/board/", requestData);

                Swal.fire({
                    icon: "success",
                    title: "게시글이 등록되었습니다",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#ea8685",
                }).then(() => {
                    navigate("/board");
                });
            } catch (error) {
                console.error("게시글 등록 오류:", error);

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    Swal.fire({
                        icon: "error",
                        title: "로그인이 만료되었습니다",
                        text: "다시 로그인해주세요.",
                        confirmButtonText: "확인",
                        confirmButtonColor: "#ea8685",
                    }).then(() => {
                        navigate("/member/login");
                    });
                    return;
                }

                Swal.fire({
                    icon: "error",
                    title: "게시글 등록에 실패했습니다",
                    text: error.response?.data?.message || "다시 시도해주세요.",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#ea8685",
                });
            } finally {
                setIsLoading(false);
            }
        },
        [form, loginId, navigate]
    );

    if (!accessToken || accessToken.length === 0) {
        return null;
    }

    return (
        <div className="insert-form d-f">
            <div className="row">
                <div className="col text-center">
                    <h2>게시글 작성</h2>
                    <hr />
                </div>
            </div>

            <form onSubmit={handleSubmitForm}>
                {/* 카테고리 */}
                <div className="row mt-2">
                    <label className="col-sm-3 col-form-label">카테고리</label>
                    <div className="col-sm-9">
                        <select
                            name="boardCategory"
                            value={form.boardCategory}
                            onChange={handleChangeForm}
                            className="form-control"
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 제목 */}
                <div className="row mt-2">
                    <label className="col-sm-3 col-form-label">
                        제목 <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <div className="col-sm-9">
                        <input
                            type="text"
                            name="boardTitle"
                            value={form.boardTitle}
                            onChange={handleChangeForm}
                            className="form-control"
                            placeholder="제목을 입력해주세요"
                            maxLength="200"
                        />
                        <small style={{ color: "#999999" }}>
                            {form.boardTitle.length}/200
                        </small>
                    </div>
                </div>

                {/* 내용 */}
                <div className="row mt-2">
                    <label className="col-sm-3 col-form-label">
                        내용 <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <div className="col-sm-9">
                        <textarea
                            name="boardContent"
                            value={form.boardContent}
                            onChange={handleChangeForm}
                            className="form-control"
                            placeholder="내용을 입력해주세요"
                            rows="10"
                            style={{
                                resize: "vertical",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                            }}
                        ></textarea>
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="row mt-3">
                    <div className="col-sm-3"></div>
                    <div className="col-sm-9">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "등록 중..." : "등록"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate("/board")}
                            disabled={isLoading}
                        >
                            취소
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
