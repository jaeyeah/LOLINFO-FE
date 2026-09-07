import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
    return (
        <main className="about-page">
            <Helmet>
                <title>서비스 소개 및 데이터 집계 기준 | SoopLOL</title>
                <meta
                    name="description"
                    content="SoopLOL의 서비스 소개와 CK, 대회, 스크림 통계의 데이터 집계 기준 및 수정·문의 방법을 안내합니다."
                />
                <link rel="canonical" href="https://sooplol.com/about" />
            </Helmet>

            <header className="about-header" id="service-introduction">
                <p className="about-eyebrow">SOOPLOL GUIDE</p>
                <h1>SoopLOL 소개</h1>
                <p className="about-lead">SOOP 롤 스트리머의 경기와 대회 기록을 한곳에서.</p>
                <p>
                    SoopLOL은 SOOP에서 활동하는 리그 오브 레전드 스트리머의 CK 경기와 대회 기록을
                    모아 보여주는 개인 운영 통계 서비스입니다. 스트리머별 기록과 대회 정보를 같은
                    기준으로 살펴볼 수 있도록 정리하고 있습니다.
                </p>
            </header>

            <nav className="about-nav" aria-label="서비스 소개 페이지 바로가기">
                <a href="#service-introduction">서비스 소개</a>
                <a href="#data-criteria">집계 기준</a>
                <a href="#feedback">수정 및 문의</a>
            </nav>

            <div className="about-body">
                <section aria-labelledby="why-title">
                    <h2 id="why-title">제작 목적</h2>
                    <p>
                        관심있는 스트리머의 최근 CK성적이 어떤지, 그동안의 대회 성적이 어땠는지에서 시작하여
                        두 스트리머가 같은 팀이나 상대 팀으로 만났을 때 어떤 결과가 있었는지 쉽게 확인할 수 있도록 만들었습니다.
                        이전 멸망전에 어떤 팀으로 참가했고 어떤 성적을 기록했는지도 대회 이력에서 찾아볼 수 있습니다.
                    </p>
                </section>

                <section aria-labelledby="information-title">
                    <h2 id="information-title">제공하는 정보</h2>
                    <ul>
                        <li>
                            <Link to="/streamer">스트리머 기록</Link>에서 스트리머별 CK 전적, 승률,
                            최근 기록을 확인할 수 있습니다.
                        </li>
                        <li>
                            스트리머 상세 화면에서는 맞라인 상대 전적과 CK에서 함께 출전한 팀메이트
                            전적을 구분해 볼 수 있습니다.
                        </li>
                        <li>
                            <Link to="/ck">CK 기록과 월간 랭킹</Link>에서 등록된 CK 경기 목록과
                            월별 다승 순위를 확인할 수 있습니다.
                        </li>
                        <li>
                            <Link to="/tournament">대회 정보</Link>에서 대회 기간, 참가 팀과 선수,
                            팀별 최종 성적 및 스트리머의 대회 참가 이력을 확인할 수 있습니다.
                        </li>
                        <li>
                            멸망전 등 대회의 상세 화면에서는 해당 대회를 기준으로 등록된 스트리머
                            티어표와 스크림 기록을 확인할 수 있습니다.
                        </li>
                    </ul>
                </section>

                <section id="data-criteria" aria-labelledby="criteria-title">
                    <h2 id="criteria-title">데이터 및 집계 기준</h2>
                    <p className="about-note">
                        아래 통계는 SoopLOL에 등록된 경기와 대회 기록을 기준으로 합니다. 기록이 누락되거나
                        등록이 늦어지면 실제 전체 경기·대회 기록과 차이가 날 수 있습니다.
                    </p>

                    <h3>CK 경기 수와 승패</h3>
                    <ul> 
                        <li> CK 기록은 세트별이 아닌 <strong>매치 단위</strong>로 집계합니다. 예를 들어 A팀과 B팀의 경기 결과가 <strong>A팀 2 : 1 B팀</strong>인 경우, 세트별 2승 1패로 기록하지 않고 해당 매치 결과를 기준으로 <strong>A팀 1승, B팀 1패</strong>로 기록합니다. </li>
                        <li> 매치별 상세 세트 기록은 별도로 제공하지 않습니다. 따라서 한 매치 내에서 특정 포지션의 스트리머가 교체되어 경기가 진행된 경우에는 실제 출전 세트와 SoopLOL의 CK 전적 기록 사이에 차이가 발생할 수 있습니다. </li>
                        <li> 스트리머 CK 화면은 서버에 등록된 승리 수, 패배 수와 전체 경기 수를 기준으로 전적을 표시합니다. </li>
                        <li> 승패가 아직 확정되지 않은 예정 또는 진행 중인 CK도 전체 경기 수에 포함될 수 있습니다. 이 경우 승리 수와 패배 수에는 아직 반영되지 않은 상태에서 전체 경기 수만 증가하므로, 승률이 일시적으로 실제 확정 전적보다 낮게 표시될 수 있습니다. </li>
                        <li> 승률은 <strong>승리 수 ÷ 전체 등록 경기 수 × 100</strong>을 기준으로 표시하며, 승패 미확정 경기가 포함되어 있는 경우 해당 경기 역시 승률 계산의 분모에 포함됩니다. </li>
                        <li> 승률은 소수 첫째 자리까지 표시하며, 기록이 없을 때는 화면에 0% 또는 전적 없음으로 표시될 수 있습니다. </li>
                    </ul>

                    <h3>월간 CK 기록과 랭킹</h3>
                    <ul>
                        <li>월을 선택하면 해당 <code>YYYY-MM</code> 값을 서버에 전달해 월간 다승 Top 10을 조회합니다.</li>
                        <li>화면의 순위는 서버가 반환한 순서대로 표시되고, 경기 수와 승·패 및 승률이 함께 표시됩니다.</li>
                    </ul>

                    <h3>최근 경기</h3>
                    <p>
                        CK 목록과 스트리머별 CK 기록은 서버가 전달한 페이지 단위 목록을 표시하며, 목록 한 페이지의
                        기본 크기는 10건입니다.
                    </p>

                    <h3>상대 전적과 동료 전적</h3>
                    <ul>
                        <li>맞라인 상대 전적은 CK 화면에서 상대 스트리머와 포지션별 기록으로 구분해 제공합니다.</li>
                        <li>팀메이트 전적은 CK 팀메이트와 대회 팀메이트 화면으로 나뉘며, 대회 팀메이트는 함께 출전한 팀과 대회 결과를 보여줍니다.</li>
                        <li>따라서 CK 기록과 대회 참가 기록을 하나의 전적으로 합산하지 않습니다.</li>
                    </ul>

                    <h3>스크림과 대회 티어표</h3>
                    <ul>
                        <li>스크림은 대회 상세 화면에 등록된 날짜, 시간, 두 팀의 점수와 경기 유형을 기준으로 표시합니다. 0:0은 예정 경기 등록에도 사용됩니다.</li>
                        <li>대회 티어표는 해당 대회에 등록된 시점과 대회 기준의 포지션별 정보입니다.</li>
                        <li>대회 티어표는 현재 게임 내 랭크나 현재 시점의 실력 평가와 다를 수 있습니다.</li>
                    </ul>

                    <h3>숫자를 읽을 때</h3>
                    <p>
                        경기 수와 참가 구성, 등록된 상대와 팀의 범위가 통계에 영향을 줍니다. 따라서 승률이나 순위만으로
                        스트리머의 실력을 단정하기보다는 기록의 범위와 맥락을 함께 확인해 주세요.
                    </p>

                </section>

                <section id="feedback" aria-labelledby="feedback-title">
                    <h2 id="feedback-title">데이터 수정 및 문의</h2>
                    <p>
                        기록 누락이나 잘못된 정보는 각 스트리머, CK, 대회 상세 화면에 있는 오류·누락 제보 기능으로
                        알려주세요. 서비스 이용 관련 문의와 기능 개선 의견은 <Link to="/board/write?category=문의">문의 게시판</Link>에서
                        접수할 수 있습니다.
                    </p>
                    <p>
                        제보 내용은 운영자가 확인한 뒤 필요한 경우 기록에 반영합니다. 별도의 처리 기한은 안내하지 않습니다.
                    </p>
                </section>

                <section aria-labelledby="operation-title">
                    <h2 id="operation-title">운영 안내</h2>
                    <p>
                        SoopLOL은 개인이 개발·운영하는 비공식 서비스이며, SOOP 또는 Riot Games의 공식 서비스가 아닙니다.
                        이 페이지에서 확인되지 않은 데이터 출처, 수집 방식 또는 이용 허락 여부는 별도로 단정하지 않습니다.
                    </p>
                </section>
            </div>
        </main>
    );
}
