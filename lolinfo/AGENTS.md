# AGENTS.md

## 프로젝트 개요

SOOPLOL은 SOOP의 LoL 스트리머, CK 경기 기록, 대회, 팀,
스크림 및 통계를 제공하는 React 프론트엔드 SPA다.

이 저장소는 프론트엔드 전용이며 백엔드 코드는 작업 범위가 아니다.
백엔드 변경이 필요하면 백엔드를 수정하지 않고 필요한 API 계약만 정리해서 보고한다.

기능을 구현하기 전에 관련 페이지, 하위 컴포넌트, API 호출,
CSS 및 상태 관리 코드를 확인한다.

## 기술 스택

- React 19 / React DOM 19
- Vite 7
- JavaScript / JSX, ES Modules
- React Router DOM 7
- axios
- Jotai
- Bootstrap 5 및 일반 CSS
- React Icons
- SweetAlert2
- Chart.js / react-chartjs-2
- html-to-image
- react-ga4
- ESLint 9

TypeScript나 새로운 UI·상태 관리 라이브러리를 임의로 도입하지 않는다.

## 디렉터리 구조

- src/main.jsx: React 진입점, CSS 및 axios 초기화
- src/App.jsx: BrowserRouter와 공통 레이아웃
- src/components/Content.jsx: 전체 라우트 선언
- src/components/home/: 홈 화면
- src/components/ck/: 전체 CK 목록, 등록, 월간 랭킹
- src/components/streamer/: 스트리머 목록, 상세, 개인 CK 기록
- src/components/streamer/streamerWith/: 동료 CK·대회 기록
- src/components/tournament/: 대회, 팀, 스크림, 티어
- src/components/member/: 회원가입, 로그인
- src/components/mypage/: 회원 정보, 등록 기록, 즐겨찾기
- src/components/admin/: 관리자 화면
- src/components/board/: 게시판
- src/components/etc/: 피드백, 광고 영역, 개발 이력
- src/components/: Menu, Footer, Pagination 등 공통 컴포넌트
- src/utils/axios/index.js: 공통 axios 설정 및 인증 인터셉터
- src/utils/jotai/index.js: 로그인·인증 관련 전역 상태
- src/utils/ckPeriod.js: CK 날짜 계산 및 기간 검증
- src/utils/profileUrl.js: SOOP 프로필 이미지 주소 생성
- src/utils/visitTracker.js: 방문 추적
- src/utils/localStorage/cleanStorage.js: 만료된 조회 기록 정리
- public/: 정적 파일, robots.txt, sitemap.xml
- scripts/: 사이트맵 생성 스크립트
- tests/: 유틸리티 테스트

페이지와 하위 컴포넌트는 기존 도메인 폴더에 배치한다.
새로운 pages, services, hooks 계층으로 기존 코드를 일괄 이동하지 않는다.

## 라우팅 규칙

- 전체 라우트는 src/components/Content.jsx에서 관리한다.
- BrowserRouter의 basename은 VITE_BASE_URL을 사용한다.
- 내부 이동에는 Link, NavLink, useNavigate를 사용한다.
- 상세 화면의 탭은 기존 중첩 Route와 Outlet 패턴을 따른다.
- 부모 상세 화면이 조회한 데이터는 Outlet context로 전달하고,
  자식은 useOutletContext로 받는다.
- 상세 탭을 추가할 때 부모 탭 링크와 자식 Route를 함께 반영한다.
- 기존 URL, 경로 매개변수 이름, 리다이렉트 동작을 임의로 바꾸지 않는다.
- 새 접근 제한 화면은 버튼 표시뿐 아니라 직접 URL 접근도 고려한다.
- 프론트엔드의 권한 판정을 서버 권한 검증의 대체로 취급하지 않는다.

## axios 사용 규칙

- 새 API 호출은 상대 경로로 src/utils/axios 모듈을 import해 사용한다.
- 기존 코드에는 axios 패키지 직접 import가 혼용되어 있으나,
  이를 정리하기 위한 일괄 수정은 하지 않는다.
- API 기본 주소는 VITE_AXIOS_URL을 사용한다.
- 공통 타임아웃, 인증 헤더, 토큰 갱신은 기존 인터셉터를 재사용한다.
- 컴포넌트마다 axios 인스턴스나 인증 인터셉터를 새로 만들지 않는다.
- 기존 API 경로, HTTP 메서드, 필드명, 쿼리 및 응답 계약을 유지한다.
- API 동작이 불명확하면 기존 호출 코드와 제공된 API 명세를 확인한다.
  확인되지 않은 API 응답 필드, 필드 타입, 백엔드 동작을 추측해 구현하지 않는다.
- 백엔드 변경이 필요하면 필요한 API 경로, HTTP 메서드, 요청·응답 구조,
  오류·권한 조건 등 API 계약만 정리해서 보고한다.
  확인된 기존 계약과 제안하는 계약을 구분하고 백엔드 코드는 수정하지 않는다.
- 로딩, 오류, 빈 결과를 화면에서 구분한다.
- 목록 API가 list와 pageVO를 반환하면 기존 Pagination 패턴을 따른다.
- 검색·기간 변경으로 요청이 겹칠 수 있으면 AbortController 등으로
  오래된 응답이 현재 화면 상태를 덮어쓰지 않도록 한다.
- 자동완성 타이머와 effect에서 만든 이벤트는 cleanup으로 정리한다.
- 요청과 무관한 실제 데이터 등록·수정·삭제 API를 검증 목적으로 호출하지 않는다.

## Jotai 사용 범위

- Jotai는 주로 로그인 정보, 권한, access token, refresh token에 사용한다.
- 기존 atom은 src/utils/jotai/index.js에서 재사용한다.
- 로그인 여부는 loginState, 관리자 여부는 adminState를 활용한다.
- 기존 sessionStorage 저장 키를 임의로 변경하지 않는다.
- 검색어, 페이지, 폼, 모달, 화면별 API 응답은 기본적으로 useState로 관리한다.
- 상세 화면 내부 공유에는 props 또는 Outlet context를 우선 사용한다.
- 앱 전체에서 공유할 필요가 명확할 때만 전역 atom을 추가한다.
- 현재 axios는 Jotai 기본 store에 접근하므로 별도 Provider나 store를
  추가할 때 인증 상태가 분리되지 않는지 확인한다.

## 컴포넌트 작성 패턴

- PascalCase 파일명과 함수형 컴포넌트, JSX를 사용한다.
- 주변 코드의 export default 및 import 방식을 따른다.
- 입력은 기존 controlled input 패턴을 따른다.
- 객체·배열 상태는 직접 변경하지 않고 새 값으로 갱신한다.
- 파생 값은 필요에 따라 useMemo로 계산한다.
- useCallback, memo 등은 실제 필요가 있을 때 사용한다.
- 큰 화면의 독립적인 기능은 같은 도메인의 하위 컴포넌트로 분리한다.
- Pagination, FeedbackModal, AdArea 등 기존 공통 컴포넌트를 재사용한다.
- SOOP 프로필 주소는 buildProfileUrl을 사용한다.
- CK 기간 계산·검증은 ckPeriod 유틸을 재사용한다.
- CK 포지션 코드 TOP, JUG, MID, AD, SUP와 red/blue 구분을 유지한다.
- 전체 CK 기능은 ck/, 개인 스트리머 CK 기능은 streamer/에 배치한다.
- 사용자 안내 문구는 기존 한국어 표현과 화면 용어에 맞춘다.

## Bootstrap 및 CSS 규칙

- Bootstrap 5와 기존 일반 CSS를 우선 사용한다.
- 기존 다크 테마, 버튼, 카드, 표, 폼 스타일을 따른다.
- 도메인 CSS는 해당 도메인 폴더에서 관리한다.
- 일반 CSS는 전역에 적용되므로 새 클래스에는 화면·기능 접두사를 사용한다.
- 기존 공통 클래스 변경은 다른 화면에 미치는 영향을 확인한다.
- 도메인 간 CSS import 의존성을 확인한 뒤 수정한다.
- !important와 인라인 스타일을 불필요하게 늘리지 않는다.
- 요청 없이 CSS Modules, Tailwind, CSS-in-JS 등을 도입하지 않는다.
- 스타일 정리를 이유로 다른 화면의 디자인을 변경하지 않는다.

## 모바일 반응형

- 새 화면과 변경한 화면은 모바일과 데스크톱을 모두 고려한다.
- Bootstrap의 row, col-*, 표시 유틸리티와 기존 미디어 쿼리를 활용한다.
- 주변 코드의 576px, 768px, 992px 부근 분기 기준을 우선 따른다.
- 좁은 화면에서는 다단 레이아웃의 세로 배치를 고려한다.
- 넓은 표는 기존 table-responsive 패턴을 활용한다.
- 긴 이름, 작은 화면, 빈 데이터에서도 레이아웃이 깨지지 않도록 한다.
- 모달의 높이와 스크롤, 버튼의 터치 영역, 사이드바 닫기를 고려한다.
- 고정 헤더나 sticky 요소가 콘텐츠를 가리지 않도록 확인한다.
- 실제 브라우저 검증을 하지 못했다면 완료 보고에 명시한다.

## 변경 범위 및 코드 스타일

- 기존 코드 스타일과 인접 컴포넌트의 패턴을 우선한다.
- 들여쓰기, 따옴표, 세미콜론, 네이밍을 불필요하게 통일하지 않는다.
- 요청한 기능을 구현하는 데 필요한 범위만 수정한다.
- 불필요한 리팩터링, 파일 이동, 이름 변경, 전체 포맷팅을 하지 않는다.
- 요청받지 않은 기존 기능, API 계약, 권한 정책, 화면 동작을 변경하지 않는다.
- 작업과 무관한 버그나 개선점은 별도로 보고한다.
- 사용자가 작성한 변경 사항을 덮어쓰거나 되돌리지 않는다.
- 패키지 추가·업그레이드와 lockfile 변경은 작업에 필요한 경우로 제한한다.
- 분석이나 초안만 요청받았다면 파일을 생성하거나 수정하지 않는다.

## 검증 및 완료 보고

- 코드 작업 완료 후 npm run build를 실행한다.
- 분석·초안 작성만 요청받았거나 사용자가 명령 실행을 제한한 경우는 제외한다.
- 변경한 로직과 관련된 기존 테스트가 있으면 함께 실행한다.
- CK 기간 유틸 테스트는 node --test tests/ckPeriod.test.js로 실행할 수 있다.
- 필요하면 npm run lint를 실행하되, 기존 오류를 이유로 무관한 코드를
  광범위하게 수정하지 않는다.
- build는 실행 시점의 번들 생성 검증이며 API·권한·모바일 동작까지
  보장하지 않으므로 변경 범위에 맞는 검증을 추가한다.
- 빌드 실패 시 원인과 이번 변경의 관련성을 확인한다.
- 기존 문제나 환경 제약으로 검증하지 못했으면 성공으로 보고하지 않는다.
- 완료 보고는 다음 순서를 따른다.
  1. 변경 요약
  2. 수정한 파일
  3. 검증 결과
  4. 확인이 필요한 사항

## 작업 전 확인사항

다음 항목은 관련 작업 전에 현재 코드와 설정을 기준으로 확인한다.
이미 문제가 해결되었을 수 있으므로 기존 문제로 단정하거나 관련 요청 없이 일괄 수정하지 않는다.

- react-helmet-async 등 실제 import하는 패키지의 package.json 및 lockfile 선언 여부
- CK 기간 유틸이 지원하는 프리셋과 관련 테스트의 일치 여부
- 작업 대상 화면의 로그인·관리자 접근 가드와 직접 URL 접근 동작
- 수정할 화면이 다른 도메인의 전역 CSS에 의존하는지 여부
