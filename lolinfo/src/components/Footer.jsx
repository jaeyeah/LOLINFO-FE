import { Link } from "react-router-dom";
import "./Footer.css";
import Swal from "sweetalert2";



export default function Footer() {


	const handleCopyEmail = async () => {
		await navigator.clipboard.writeText("limjh819@naver.com");

		Swal.fire({
			icon: "success",
			title: "이메일 주소 복사 완료",
			text: "limjh819@naver.com",
			timer: 1500,
			showConfirmButton: false,
		});
	};

	return (
		<footer className="site-footer">
			<div className="site-footer-inner">
				<div>
					<strong className="site-footer-brand">SoopLOL</strong>
					<p className="site-footer-description">
						SOOP 리그 오브 레전드 대회 및 스트리머 데이터/통계 서비스
					</p>
				</div>
				<nav className="site-footer-links" aria-label="사이트 정보">
					<Link to="/privacy">개인정보처리방침</Link>
					<span> | </span>
					<Link to="/terms">이용약관</Link>
					<span> | </span>
					<Link to="/devhistory">패치노트</Link>
					<span> | </span>
					<Link to="/board/write?category=문의">문의하기</Link>
				</nav>
				<nav className="site-footer-links" aria-label="사이트 정보">
					
				</nav>
                <span className="site-footer-email" role="button" onClick={handleCopyEmail} tabIndex={0}>
					개별문의 : limjh819@naver.com
				</span>
				<small className="site-footer-copyright">
					© 2026 SoopLOL. All rights reserved.
				</small>
			</div>
		</footer>
	);
}
