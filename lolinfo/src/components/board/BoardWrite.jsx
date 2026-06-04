import { useAtomValue } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Board.css";

const CATEGORIES = [
    { value: "문의", label: "문의" },
    { value: "신고", label: "신고" },
    { value: "건의", label: "건의" },
    { value: "자유", label: "자유" },
];

export default function BoardWrite() {
    const accessToken = useAtomValue(accessTokenState);
    const navigate = useNavigate();

    // Form state
    const [form, setForm] = useState({
        boardCategory: "문의",
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
        <div className="board-write-container">
            <div className="board-write-card">
                <h1 className="board-write-title">게시글 작성</h1>

                <form onSubmit={handleSubmitForm} className="board-write-form">
                    {/* 카테고리 */}
                    <div className="form-group">
                        <label htmlFor="boardCategory" className="form-label">
                            카테고리
                        </label>
                        <select
                            id="boardCategory"
                            name="boardCategory"
                            value={form.boardCategory}
                            onChange={handleChangeForm}
                            className="form-control board-select"
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 제목 */}
                    <div className="form-group">
                        <label htmlFor="boardTitle" className="form-label">
                            제목 <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="boardTitle"
                            name="boardTitle"
                            value={form.boardTitle}
                            onChange={handleChangeForm}
                            className="form-control board-input"
                            placeholder="제목을 입력해주세요"
                            maxLength="200"
                        />
                        <small className="text-muted">
                            {form.boardTitle.length}/200
                        </small>
                    </div>

                    {/* 내용 */}
                    <div className="form-group">
                        <label htmlFor="boardContent" className="form-label">
                            내용 <span className="required">*</span>
                        </label>
                        <textarea
                            id="boardContent"
                            name="boardContent"
                            value={form.boardContent}
                            onChange={handleChangeForm}
                            className="form-control board-textarea"
                            placeholder="내용을 입력해주세요"
                            rows="10"
                        ></textarea>
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="board-button-group">
                        <button
                            type="submit"
                            className="btn btn-primary board-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? "등록 중..." : "등록"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary board-cancel-btn"
                            onClick={() => navigate("/board")}
                            disabled={isLoading}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
