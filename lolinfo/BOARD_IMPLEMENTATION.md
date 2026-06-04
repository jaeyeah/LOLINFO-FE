# LOLINFO 게시판 작성 기능 구현 완료

## 📋 구현 내용

### 1. 생성된 파일

#### `src/components/board/BoardWrite.jsx`
- **기능**: 게시글 작성 페이지
- **주요 특징**:
  - ✅ 로그인 필수 (accessToken 없으면 로그인 페이지로 리다이렉트)
  - ✅ SweetAlert2로 사용자 친화적인 메시지 표시
  - ✅ 카테고리 선택 (문의, 신고, 건의, 자유)
  - ✅ 제목 입력 (최대 200자)
  - ✅ 내용 입력 (textarea, 필수)
  - ✅ 유효성 검증 (제목, 내용 필수 입력)
  - ✅ axios POST 요청: `/board/`
  - ✅ 성공 시: 게시판 목록(`/board`)으로 자동 이동
  - ✅ 401/403 오류: 로그인 페이지로 리다이렉트
  - ✅ 기타 오류: 상세 메시지 표시

#### `src/components/board/BoardList.jsx`
- **기능**: 게시판 목록 페이지
- **주요 특징**:
  - ✅ 게시글 목록 조회 (GET `/board/`)
  - ✅ 카테고리별 필터링 (전체, 문의, 신고, 건의, 자유)
  - ✅ 글쓰기 버튼으로 작성 페이지 이동
  - ✅ 게시글 클릭 시 상세 페이지 이동 (추후 구현)

#### `src/components/board/Board.css`
- **스타일**: SOOPLOL 프로젝트 스타일 유지
  - ✅ Bootstrap 기반
  - ✅ 어두운 배경 (#353535, #3d4257)
  - ✅ 골드 색상 강조 (#ffd700)
  - ✅ 카드 형태 UI
  - ✅ 모바일 반응형 (768px, 480px 브레이크포인트)

### 2. 수정된 파일

#### `src/components/Content.jsx`
- ✅ BoardWrite 컴포넌트 import 추가
- ✅ BoardList 컴포넌트 import 추가
- ✅ 라우트 설정:
  - `/board` → BoardList (게시판 목록)
  - `/board/write` → BoardWrite (게시글 작성)

#### `src/components/Menu.jsx`
- ✅ 로그인 사용자에게 "글쓰기" 버튼 추가
- ✅ 클릭 시 `/board/write`로 이동

### 3. 기술 스택 활용

#### Axios
- **기존 설정 활용**:
  - baseURL: `import.meta.env.VITE_AXIOS_URL` (자동 붙음)
  - Request Interceptor: Authorization 헤더 자동 추가
  - Response Interceptor: 토큰 갱신 자동 처리

#### Jotai (상태 관리)
- `accessTokenState`: 로그인 토큰 관리
- 로그인 확인 로직에 활용

#### SweetAlert2
- 사용자 친화적인 알림/확인 다이얼로그
- `Swal.fire()` 사용

#### React Router
- `useNavigate()`: 페이지 이동
- `useAtomValue()`: 전역 상태 조회

## 🔄 API 통신 흐름

### 요청 데이터 구조
```javascript
// POST /api/board/
{
  "boardCategory": "문의",  // 필수
  "boardTitle": "제목",      // 필수
  "boardContent": "내용"     // 필수
}
```

**주의**: `boardWriter`, `boardId`, `boardWtime`, `boardCheck`는 백엔드에서 자동 처리됨

### 응답 처리
- **성공 (2xx)**: 게시판 목록으로 이동
- **401/403**: 로그인 페이지로 리다이렉트
- **기타 오류**: 에러 메시지 표시

## 🔐 보안 고려사항

### 현재 구현 (프론트에서 boardWriter 미전송)
- ✅ Authorization 헤더의 토큰을 통해 인증 수행
- ✅ 프론트에서 사용자 ID 조작 불가능
- ✅ 백엔드에서 토큰 파싱 시 자동으로 boardWriter 설정 필요

### 백엔드 수정 사항 (권장)
```java
// Controller
@PostMapping("/board/")
public ResponseEntity<?> insertBoard(
    @RequestBody BoardDTO boardDTO,
    @RequestHeader("Authorization") String authHeader
) {
    // 토큰에서 loginId 추출
    String loginId = parseLoginIdFromToken(authHeader);
    
    // DTO에 자동으로 설정
    boardDTO.setBoardWriter(loginId);
    
    return boardService.insertBoard(boardDTO);
}
```

## 📱 반응형 디자인

### 데스크톱 (≥768px)
- 최대 너비 제한: 800px
- 풀 너비 폼 표시
- 가로 배열 버튼

### 태블릿 (768px 이하)
- 패딩 감소
- 세로 배열 버튼
- 폰트 크기 조정

### 모바일 (480px 이하)
- 최소 패딩 설정
- 모든 버튼 100% 너비
- 작은 폰트 크기

## ✅ 구현 체크리스트

- [x] 로그인 체크 기능
- [x] SweetAlert2 알림
- [x] 카테고리 선택
- [x] 제목/내용 입력
- [x] 유효성 검증
- [x] API 요청 (axios)
- [x] 성공/실패 처리
- [x] 반응형 디자인
- [x] SOOPLOL 스타일 유지
- [x] 라우터 설정
- [x] 네비게이션 추가
- [x] 프론트에서 boardWriter 미전송 (보안)

## 🚀 사용 방법

1. **로그인 후 게시글 작성**
   - 로그인 → Menu의 "글쓰기" 클릭 → `/board/write` 이동

2. **게시판 목록 확인**
   - `/board` 경로로 이동
   - 카테고리 필터 적용 가능
   - 글쓰기 버튼으로 작성 페이지 이동

3. **게시글 작성**
   - 카테고리 선택
   - 제목 입력 (최대 200자)
   - 내용 입력
   - "등록" 버튼 클릭

## 📝 참고사항

- Authorization 헤더는 axios interceptor에서 자동으로 처리됨
- baseURL(`/api`)도 자동으로 붙으므로 `/board/`로만 요청
- 토큰 만료 시 자동으로 refresh 시도 후 실패하면 로그인 페이지로 이동
- 모든 API 응답은 JSON 형식으로 처리됨

## 🔗 관련 라우트

- `/` - 홈
- `/member/login` - 로그인
- `/board` - 게시판 목록
- `/board/write` - 게시글 작성
- `/board/:boardId` - 게시글 상세 (추후 구현 필요)
