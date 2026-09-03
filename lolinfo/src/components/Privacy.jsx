import "./Privacy.css";

const EFFECTIVE_DATE = "2026.09.03";

export default function Privacy() {
    return (
        <main className="privacy-page">
            <header className="privacy-header">
                <p className="privacy-eyebrow">SoopLOL POLICY</p>
                <h1>개인정보처리방침</h1>
                <p>SoopLOL은 이용자의 개인정보를 중요하게 생각하며 필요한 범위 내에서 개인정보를 처리합니다.</p>
                <p className="privacy-date">시행일: {EFFECTIVE_DATE}</p>
            </header>

            <div className="privacy-body">
                <p className="privacy-note">본 방침은 현재 확인 가능한 SoopLOL 프론트엔드 동작을 기준으로 작성되었습니다. 백엔드의 보관·파기 정책은 운영 설정에 따라 최종 확인이 필요합니다.</p>

                <section><h2>제1조 개인정보의 처리 목적</h2><p>SoopLOL은 회원가입 및 회원 관리, 로그인과 사용자 식별, 이메일 인증, 서비스 제공 및 부정 이용 방지를 위해 필요한 범위에서 개인정보를 처리합니다.</p></section>

                <section><h2>제2조 처리하는 개인정보 항목</h2><h3>회원가입 시 수집하는 필수정보</h3><ul><li>아이디(ID)</li><li>비밀번호: 서비스 서버에서 단방향 해시 방식으로 저장된다는 전제이며, 평문 저장을 하지 않습니다.</li><li>닉네임</li><li>이메일 주소</li></ul><h3>인증 및 자동 생성 정보</h3><ul><li>이메일 인증번호와 인증 상태: 가입 과정의 이메일 인증을 위해 처리됩니다. 인증번호의 보관 기간은 백엔드 구현 확인이 필요합니다.</li><li>방문자 식별자(UUID), 방문일 표시값: 방문 통계를 위해 브라우저의 localStorage에 저장하고 방문 API로 전송합니다.</li><li>로그인 상태 정보와 access/refresh token: 브라우저의 sessionStorage에 저장됩니다.</li><li>최근 조회 기록: 일부 콘텐츠 조회 편의를 위해 localStorage에 저장되며 만료된 기록은 정리됩니다.</li></ul></section>

                <section><h2>제3조 개인정보의 처리 및 보유기간</h2><p>회원정보는 회원 탈퇴 처리 시까지 보유하는 것을 원칙으로 합니다. </p></section>

                <section><h2>제4조 개인정보의 제3자 제공</h2><p>현재 회원 개인정보를 제3자에게 제공하는 기능은 존재하지 않습니다. 서비스 제공에 필요한 외부 인프라 또는 API로 정보가 전달되는 경우에는 별도 검토 후 방침에 반영합니다.</p></section>

                <section><h2>제5조 개인정보 처리의 위탁</h2><p>현재 개인정보 처리 위탁 내역은 없습니다. </p></section>

                <section><h2>제6조 개인정보의 파기</h2><p>개인정보가 처리 목적을 달성하거나 불필요하게 된 경우 지체 없이 파기하는 것을 원칙으로 합니다. </p></section>

                <section><h2>제7조 이용자의 권리</h2><p>이용자는 자신의 개인정보에 대해 열람, 정정, 삭제 및 회원 탈퇴를 요청할 수 있습니다.</p></section>

                <section><h2>제8조 개인정보의 안전성 확보조치</h2><p>비밀번호를 평문으로 다루지 않고 단방향 해시 방식으로 저장하는 전제를 사용합니다. 로그인 토큰은 sessionStorage에 저장되고 API 요청 인증에 사용됩니다. HTTPS 적용, 인증정보 접근 제한, 데이터베이스 접근 통제는 배포·백엔드 환경의 실제 적용 여부를 확인한 뒤 관리합니다.</p></section>

                <section><h2>제9조 쿠키 및 자동수집 정보</h2><p>최초 방문 시 브라우저에 방문자 UUID를 생성하고 일일 방문 여부를 localStorage에 저장하여 방문 API에 전송합니다. 별도의 Cloudflare Analytics 등 외부 분석 도구가 사용되지 않습니다. </p></section>
                
                <section><h2>제10조 개인정보 보호 관련 문의</h2>
                    <p>
                        SoopLOL은 별도의 개인정보 관련 문의 창구를 운영하고 있지 않습니다.
                        개인정보의 열람, 정정, 삭제 등은 서비스에서 제공하는 회원정보 관리 및
                        회원탈퇴 기능을 통해 처리할 수 있습니다.
                    </p>
                </section>
                
                <section><h2>제11조 개인정보처리방침의 변경</h2><p>본 방침의 내용이 변경되는 경우 변경 사항과 시행일을 서비스 내에서 공지할 수 있습니다. 시행일은 실제 배포일에 맞춰 `EFFECTIVE_DATE` 값을 변경합니다.</p></section>
            </div>
        </main>
    );
}