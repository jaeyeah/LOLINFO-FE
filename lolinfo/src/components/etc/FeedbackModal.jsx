import axios from "axios";
import { useEffect, useState } from "react";
import "./FeedbackModal.css";

const TARGET_LABELS = {
	STREAMER: "스트리머",
	TOURNAMENT: "대회",
	CK: "CK",
	SCRIM: "스크림",
	TIER: "티어표",
};

const MAX_CONTENT_LENGTH = 2000;

export default function FeedbackModal({ show, onClose, targetType, targetId, targetName }) {
	const [feedbackType, setFeedbackType] = useState("");
	const [feedbackContent, setFeedbackContent] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (!show) {
			setFeedbackType("");
			setFeedbackContent("");
			setErrorMessage("");
			setSuccessMessage("");
			setIsSubmitting(false);
		}
	}, [show]);

	if (!show) return null;

	const targetLabel = TARGET_LABELS[targetType] || targetType || "알 수 없음";

	const handleClose = () => {
		if (isSubmitting) return;
		setFeedbackType("");
		setFeedbackContent("");
		setErrorMessage("");
		setSuccessMessage("");
		onClose();
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		const visitorId = localStorage.getItem("sooplol_visitor_id");
		const trimmedContent = feedbackContent.trim();

		if (!visitorId) {
			setErrorMessage("방문자 식별 정보를 찾을 수 없어 제보할 수 없습니다.");
			return;
		}
		if (!targetType) {
			setErrorMessage("제보 대상 정보가 없습니다.");
			return;
		}
		if (!feedbackType) {
			setErrorMessage("제보 유형을 선택해주세요.");
			return;
		}
		if (trimmedContent.length < 5) {
			setErrorMessage("내용을 공백 제외 5자 이상 입력해주세요.");
			return;
		}
		if (feedbackContent.length > MAX_CONTENT_LENGTH) {
			setErrorMessage(`${MAX_CONTENT_LENGTH}자 이하로 입력해주세요.`);
			return;
		}

		const requestData = {
			feedbackVisitorId: visitorId,
			feedbackTargetType: targetType,
			feedbackTargetId: targetId ?? null,
			feedbackType,
			feedbackContent: trimmedContent,
			feedbackUrl: window.location.pathname,
		};

		try {
			setIsSubmitting(true);
			await axios.post("/feedback/", requestData);
			setSuccessMessage("제보가 등록되었습니다. 확인 후 반영하겠습니다.");
			setFeedbackType("");
			setFeedbackContent("");
			setTimeout(() => onClose(), 1200);
		} catch (error) {
			const serverMessage = error.response?.data?.message || error.response?.data?.error;
			setErrorMessage(serverMessage || "제보 등록 중 오류가 발생했습니다.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<div
				className="modal fade show d-block feedback-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="feedback-modal-title"
			>
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content bg-dark text-white border-secondary">
						<div className="modal-header border-secondary">
							<h2 className="modal-title fs-5" id="feedback-modal-title">오류·누락 제보</h2>
							<button
								type="button"
								className="btn-close btn-close-white"
								aria-label="Close"
								onClick={handleClose}
								disabled={isSubmitting}
							/>
						</div>
						<form onSubmit={handleSubmit}>
							<div className="modal-body">
								<div className="mb-3">
									<label className="form-label" htmlFor="feedback-target">제보 대상</label>
									<div id="feedback-target" className="feedback-target form-control bg-dark text-white border-secondary">
										{targetLabel} &gt; {targetName || "대상 정보 없음"}
									</div>
								</div>

								<div className="mb-3">
									<label className="form-label" htmlFor="feedback-type">제보 유형</label>
									<select
										id="feedback-type"
										className="form-select bg-dark text-white border-secondary"
										value={feedbackType}
										onChange={(event) => setFeedbackType(event.target.value)}
										disabled={isSubmitting}
									>
										<option value="">선택해주세요</option>
										<option value="REQUEST">등록 요청</option>
										<option value="ERROR">정보 오류</option>
										<option value="MISSING">정보 누락</option>
										<option value="ETC">기타</option>
									</select>
								</div>

								<div className="mb-2">
									<label className="form-label" htmlFor="feedback-content">내용</label>
									<textarea
										id="feedback-content"
										className="form-control bg-dark text-white border-secondary"
										rows="5"
										maxLength={MAX_CONTENT_LENGTH}
										value={feedbackContent}
										placeholder="잘못되었거나 누락된 내용을 알려주세요."
										onChange={(event) => setFeedbackContent(event.target.value)}
										disabled={isSubmitting}
									/>
									<div className="feedback-length text-end">{feedbackContent.length} / {MAX_CONTENT_LENGTH}</div>
								</div>

								{errorMessage && <div className="alert alert-danger py-2 mb-0" role="alert">{errorMessage}</div>}
								{successMessage && <div className="alert alert-success py-2 mb-0" role="status">{successMessage}</div>}
							</div>
							<div className="modal-footer border-secondary">
								<button type="button" className="btn btn-outline-light" onClick={handleClose} disabled={isSubmitting}>취소</button>
								<button type="submit" className="btn btn-info" disabled={isSubmitting}>
									{isSubmitting ? "제보 중..." : "제보하기"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div className="modal-backdrop fade show" onClick={handleClose} />
		</>
	);
}
