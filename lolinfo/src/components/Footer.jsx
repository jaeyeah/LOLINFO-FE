import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
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
				</nav>
                <span>문의 : limjh819@naver.com</span>
				<small className="site-footer-copyright">
					© 2026 SoopLOL. All rights reserved.
				</small>
			</div>
		</footer>
	);
}
