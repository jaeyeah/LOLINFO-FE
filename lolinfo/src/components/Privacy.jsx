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

                <section><h2>제1조 개인정보의 처리 목적</h2><p>SoopLOL은 회원가입 및 회원 관리, 로그인과 사용자 식별, 이메일 인증, 서비스 제공 및 부정 이용 방지를 위해 필요한 범위에서 개인정보를 처리합니다.</p></section>

                <section><h2>제2조 처리하는 개인정보 항목</h2>
                    <h3>회원가입 시 수집하는 필수정보</h3><ul><li>아이디(ID)</li><li>비밀번호: 단방향 암호화(해시)하여 저장하며, 원문 비밀번호는 저장하지 않습니다.</li><li>닉네임</li><li>이메일 주소</li></ul>
                    <h3>인증 및 자동 생성 정보</h3><ul><li>이메일 인증번호와 인증 상태: 가입 과정의 이메일 인증을 위해 처리됩니다. </li><li>방문자 식별자(UUID), 방문일 표시값: 방문 통계를 위해 브라우저의 localStorage에 저장하고 방문 API로 전송합니다.</li><li>로그인 상태 정보와 access/refresh token: 브라우저의 sessionStorage에 저장됩니다.</li><li>최근 조회 기록: 일부 콘텐츠 조회 편의를 위해 localStorage에 저장되며 만료된 기록은 정리됩니다.</li></ul>
                    <h3>비회원 의견 제출 시 수집하는 정보</h3><ul><li>비회원 의견 제출 시 방문자 식별자(UUID), 의견 유형, 의견 내용, 대상 콘텐츠 정보 및 페이지 URL이 처리될 수 있습니다.</li></ul>
                </section>

                <section><h2>제3조 개인정보의 처리 및 보유기간</h2><p>회원정보는 회원 탈퇴 처리 시까지 보유하는 것을 원칙으로 합니다. </p><p>방문자 UUID 및 방문기록은 통계 목적 달성 후 일정 기간 보관 후 파기합니다 </p></section>

                <section>
                    <h2>제4조 개인정보의 제3자 제공</h2>
                    <p>
                        SoopLOL은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                        다만 이용자의 동의가 있거나 법령에 따라 요구되는 경우에는 예외로 합니다.
                    </p>
                </section>
                <section>
                    <h2>제5조 외부 서비스 이용</h2>
                    <p>
                        SoopLOL은 안정적인 서비스 제공, 데이터 저장, 이용 통계 분석 등을 위해
                        외부 클라우드 및 분석 서비스를 이용할 수 있습니다.
                    </p>
                    <p>
                        외부 서비스를 통해 처리되는 정보는 해당 서비스 제공에 필요한 범위에서
                        처리됩니다.
                    </p>
                </section>
                <section><h2>제6조 개인정보의 파기</h2><p>개인정보가 처리 목적을 달성하거나 불필요하게 된 경우 지체 없이 파기하는 것을 원칙으로 합니다. </p></section>

                <section><h2>제7조 이용자의 권리</h2><p>이용자는 자신의 개인정보에 대해 열람, 정정, 삭제 및 회원 탈퇴를 요청할 수 있습니다.</p></section>

                <section><h2>제8조 개인정보의 안전성 확보조치</h2><p>비밀번호는 단방향 암호화(해시)하여 저장하며, 원문 비밀번호는 저장하지 않습니다. 로그인 토큰은 sessionStorage에 저장되고 API 요청 인증에 사용됩니다.</p></section>

                <section><h2>제9조 쿠키 및 자동수집 정보</h2>
                    <p>SoopLOL은 방문 통계 및 서비스 이용 현황 분석을 위해 브라우저의
                        localStorage 및 쿠키 등의 기술을 사용할 수 있습니다.
                    </p>
                    <p>최초 방문 시 방문자 식별자(UUID)를 생성하여 localStorage에 저장하며,
                        일일 방문 여부를 확인하기 위한 정보도 localStorage에 저장됩니다.
                        해당 정보는 방문 통계 처리를 위해 서버로 전송될 수 있습니다.
                    </p>
                </section>

                <section><h2>제10조 Google Analytics 이용</h2>
                    <p>SoopLOL은 서비스 이용 현황 분석 및 서비스 개선을 위해
                        Google Analytics를 사용합니다.
                    </p>
                    <p>Google Analytics 이용 과정에서 쿠키, 기기 및 브라우저 정보,
                        IP 주소, 방문 페이지, 이용 행태 등의 정보가 자동으로 처리될 수 있습니다.
                    </p>
                </section>
                <section><h2>제11조 개인정보 보호 관련 문의</h2>
                    <p>
                        SoopLOL은 별도의 개인정보 관련 문의 창구를 운영하고 있지 않습니다.
                        개인정보의 열람, 정정, 삭제 등은 서비스에서 제공하는 회원정보 관리 및
                        회원탈퇴 기능을 통해 처리할 수 있습니다.
                    </p>
                </section>
                
                <section>
                    <h2>제12조 개인정보처리방침의 변경</h2>
                    <p>
                        본 개인정보처리방침의 내용이 변경되는 경우 서비스 내 공지 등을 통해
                        변경 내용과 시행일을 안내할 수 있습니다.
                    </p>
                </section>

                <section>
                    <h2>부칙</h2>
                    <p>본 개인정보처리방침은 2026년 9월 3일부터 시행됩니다.</p>
                </section>
            </div>
        </main>
    );
}