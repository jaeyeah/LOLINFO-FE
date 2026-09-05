import "./../Privacy.css";

const LAST_UPDATED = "2026.09.05";

export default function DevHistory() {
    return (
        <main className="privacy-page">
            <header className="privacy-header">
                <p className="privacy-eyebrow">SoopLOL Develop History</p>
                <h1>패치노트</h1>
                <p className="privacy-date">최종 업데이트: {LAST_UPDATED}</p>
            </header>

            <div className="privacy-body">

                <section><h2 className="fw-bold">26.09.05</h2>
                    <p className="danger-note">
                        - 서버 성능 개선<br/>
                        <span className="text-secondary ms-4">└ 백엔드 서버 리전 이전을 통한 API 응답 속도 개선</span><br/>
                    </p>
                </section>

                <section><h2 className="fw-bold">26.09.03</h2>
                    <p className="privacy-note">
                        - <span className="text-info fw-bold">메인페이지</span> 추가<br/>
                        - 신규기능 : <span className="text-info fw-bold">비회원 피드백</span> 구현<br/>
                        - Footer 및 개인정보처리방침 추가<br/>
                        - 검색엔진 노출 개선 (SEO 및 사이트맵 적용)<br/>
                    </p>
                </section>

                <section><h2 className="fw-bold">26.07.13</h2>
                    <p className="privacy-note">
                        - 신규기능 : 멸망전 <span className="text-info fw-bold">롤 티어표</span> 구현<br/>
                        - CK 월간랭킹 구현<br/>
                    </p>
                </section>
                <section><h2 className="fw-bold">26.06.30</h2>
                    <p className="privacy-note">
                        - 신규기능 : 즐겨찾기 (스트리머 및 대회)<br/>
                        - 마이페이지 기능개선<br/>
                        - 검색 기능개선<br/>
                    </p>
                </section>
                <section><h2 className="fw-bold">26.06.23</h2>
                    <p className="privacy-note">
                        - 신규기능 : <span className="text-info fw-bold">Teammate</span> 구현<br/>
                        - 검색 자동완성 추가<br/>
                        - 스트리머 상세 : 컴포넌트 분리/개선<br/>
                        - 팀별 감독/코치 기능개선<br/>
                    </p>
                </section>
                <section><h2 className="fw-bold">26.06.16</h2>
                    <p className="privacy-note">
                        - 신규기능 : 대회별 <span className="text-info fw-bold">스크림</span> 구현<br/>
                        - 관리자 페이지 기능 추가<br/>
                        <span className="text-secondary ms-4">└ 방문 통계</span><br/>
                        <span className="text-secondary ms-4">└ 기능별 통계</span><br/>
                    </p>
                </section>

                <section><h2 className="fw-bold">26.05.19</h2>
                    <p className="privacy-note">
                        - 신규기능 : <span className="text-info fw-bold">CK</span> 구현<br/>
                        <span className="text-secondary ms-4">└ CK 등록/목록</span><br/>
                        <span className="text-secondary ms-4">└ 스트리머별 CK 상세</span><br/>
                        <span className="text-secondary ms-4">└ 포지션별 / 맞라인 상대전적</span><br/>
                        - 관리자 페이지 : 기본 회원정보관리 기능 추가
                    </p>
                </section>

                <section><h2 className="fw-bold">26.02.27</h2>
                    <p className="danger-note">
                        - Soop 롤 멸망전 대회로 인한 기능장애<br/>
                        <span className="text-secondary ms-4">└ 서버 및 DB 안정화 작업</span><br/>
                        - 팀별 감독/코치 등록<br/>
                    </p>
                </section>

                <section><h2 className="fw-bold">26.01.19 : SoopLoL 최초 배포</h2>
                    <p className="privacy-note">
                        - <span className="text-info fw-bold">대회 </span>목록 및 상세<br/>
                        <span className="text-secondary ms-4">└ 대회별 팀 목록</span><br/>
                        - <span className="text-info fw-bold">스트리머</span> 목록 및 상세<br/>
                        - 스트리머 수상기록 (우승/준우승/4강)<br/>
                        - 기본 홈페이지 작동 기능
                    </p>
                </section>
            </div>
        </main>
    );
}