# 📱 SNS 프로젝트 개요 및 상세 기능 명세서

본 문서는 `myfunction.csv` 기능 명세서를 바탕으로 작성된 **React 프론트엔드** 및 **Firebase 백엔드** 기반 소셜 네트워크 서비스(SNS)의 프로젝트 개요 및 상세 기능 명세서입니다.

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1 프로젝트 명
- **SNS Web Application** (React + Firebase 기반 페이스북 형태 소셜 네트워크 서비스)

### 1.2 목적 및 개발 배경
- 구글 소셜 로그인 기반의 간편 가입을 통해 사용자가 사진(최대 4장)과 동영상(1개), 태그를 포함한 피드를 공유하고 댓글로 소통하는 소셜 플랫폼 구축
- 일반 사용자 피드 서비스와 차별화된 관리자 전용 시스템을 분리하여 모더레이션(사용자 차단, 콘텐츠/댓글 편집 및 삭제) 및 현황 대시보드 제공

### 1.3 핵심 기술 스택 (Tech Stack)
- **Frontend**: React, React Router, CSS Modules / Tailwind CSS, Lucide Icons
- **Backend & Database (BaaS)**: Firebase
  - **Firebase Authentication**: 
    - 사용자: 구글 소셜 로그인 (Google OAuth)
    - 관리자: 이메일 / 비밀번호 로그인 (`signInWithEmailAndPassword`)
  - **Cloud Firestore**:
    - `users`: 사용자 프로필, 닉네임, 남김말, 약관동의, 가입일자, 상태(블락 여부)
    - `posts`: 게시물 본문, 태그, 미디어 URL(이미지 배열, 동영상), 대표 이미지 index, 작성자 UID, 작성일시
    - `comments`: 게시물 ID, 작성자 UID, 댓글 내용, 작성일시
  - **Firebase Storage**:
    - 프로필 이미지 저장 경로: `profiles/{userId}/...`
    - 게시물 미디어 저장 경로: `posts/{postId}/...`

### 1.4 시스템 권한 및 구조
- **일반 사용자 영역 (`/`)**: 로그인, 회원가입, 메인 피드, 검색, 게시물 등록 및 상세, 프로필, 설정
- **관리자 영역 (`/admin`)**: 분리된 진입 경로, 관리자 전용 이메일 로그인, 대시보드, 회원 관리, 콘텐츠/댓글 관리

---

## 2. 상세 기능 명세서 (Detailed Functional Specifications)

### 2.1 사용자 (User) 기능 명세

| 구분 | 화면 | 기능명 | 상세 설명 및 요구사항 | Firebase / React 구현 방안 |
|---|---|---|---|---|
| 사용자 | 로그인 화면 | 구글 로그인 | - 구글 로그인 버튼 클릭 시 소셜 로그인 수행<br>- 기존 계정 존재 시 메인 화면(`/`)으로 이동<br>- 계정 미존재 시 회원가입 화면(`/signup`)으로 이동 | `signInWithPopup(auth, googleProvider)` 활용, Firestore `users/{uid}` 문서 존재 여부 체크 |
| 사용자 | 회원가입 화면 | 회원가입 및 프로필 등록 | - 프로필 이미지, 닉네임(필수), 남김말 등록<br>- **닉네임 중복 체크**: 고유값 검증 버튼 제공<br>- **약관 동의**: 서비스 이용약관 및 개인정보 취급 방침 체크 시 회원가입 버튼 활성화<br>- 가입 완료 시 메인 화면으로 이동 | - Firestore `users` 컬렉션 닉네임 중복 쿼리<br>- Storage에 프로필 이미지 업로드<br>- Firestore 사용자 문서 생성 |
| 사용자 | 메인 화면 | 헤더 구성 | - 좌측: 로고<br>- 중앙: 검색어 입력 창<br>- 우측: 검색, 등록, 설정, 로그아웃 아이콘 버튼 배치 | Component 분리 (`Header.jsx`), React Router 링크 및 Modal 상태 제어 |
| 사용자 | 메인 화면 | 게시물 검색 | - 헤더의 검색 버튼 클릭 시 검색 모드 전환<br>- 검색어 입력 후 검색 실행 시 해당 태그가 포함된 게시물만 피드에 필터링 표시 | Firestore `array-contains` 쿼리 (`tags` 배열 필터링) |
| 사용자 | 메인 화면 | 게시물 등록 | - 등록 버튼 클릭 시 작성 다이얼로그(모달) 표시<br>- 텍스트 전용 또는 사진/동영상 첨부 가능<br>- 사진: 최대 4장 등록 가능하며 대표 이미지 선택 지원<br>- 동영상: 최대 1개 등록 가능<br>- 태그 다중 등록 기능 지원 | - File Input 검증 (사진 4장/영상 1개 제한)<br>- Storage 다중 업로드 후 URL 배열 저장<br>- 대표 이미지 인덱스(`thumbnailIndex`) 지정 |
| 사용자 | 메인 화면 | 게시물 피드 표시 | - 등록된 게시물 리스트 표시<br>- 사진 첨부 시 대표 이미지 표시 및 총 사진 수 텍스트 표시(예: "1/4")<br>- 동영상 첨부 시 썸네일과 재생 버튼 표시<br>- 댓글 개수 표시<br>- 작성자 닉네임 & 프로필 이미지 표시 (클릭 시 작성자 프로필 페이지 이동)<br>- 게시물 클릭 시 상세 화면으로 이동 | - PostCard 컴포넌트<br>- 작성자 UID 기반 프로필 매핑<br>- React Router 클릭 이벤트 |
| 사용자 | 메인 화면 | 로그아웃 | - 헤더의 로그아웃 버튼 클릭 시 로그아웃 처리 후 로그인 페이지로 이동 | `signOut(auth)` 실행 및 상태 초기화 |
| 사용자 | 게시물 상세 | 게시물 및 미디어 표시 | - 첨부된 모든 사진(갤러리/슬라이더) 표시<br>- 비디오 재생 플레이어 제공<br>- 등록된 모든 댓글 목록 표시 (프로필 이미지, 닉네임, 댓글 내용, 작성 시각) | - Dynamic Route (`/post/:id`)<br>- Firestore 댓글 컬렉션 실시간/단방향 쿼리 (`orderBy("createdAt", "asc")`) |
| 사용자 | 게시물 상세 | 댓글 작성 제한 | - 타인 작성 게시물에 댓글 작성 지원<br>- **1인당 1게시물 1댓글 제한** (동일 게시물 중복 댓글 작성 불가)<br>- **본인 작성 게시물에는 댓글 작성 불가** | - `post.authorId !== currentUser.uid` 검증<br>- 기존 댓글 내 `comment.authorId === currentUser.uid` 유무 검증 |
| 사용자 | 프로필 화면 | 프로필 정보 표시 | - 피드/댓글에서 사용자 클릭 시 해당 사용자 프로필 페이지 이동 (`/profile/:uid`)<br>- 프로필 이미지, 닉네임, 남김말, 회원가입일 표시<br>- 작성한 콘텐츠 개수 및 작성한 댓글 개수 통계 표시 | Firestore `posts` 및 `comments` 쿼리로 사용자 작성 수 카운트 계산 |
| 사용자 | 설정 화면 | 회원 정보 수정 | - 메인 헤더의 설정 버튼 클릭 시 이동 (`/settings`)<br>- 프로필 사진, 남김말, 닉네임 수정 기능<br>- 닉네임 수정 전 중복 체크 수행 | Firestore `updateDoc` 및 Storage 프로필 이미지 갱신 |

---

### 2.2 관리자 (Admin) 기능 명세

| 구분 | 화면 | 기능명 | 상세 설명 및 요구사항 | Firebase / React 구현 방안 |
|---|---|---|---|---|
| 관리자 | 관리자 로그인 | 관리자 전용 로그인 | - 일반 사용자 로그인과 진입 경로 분리 (`/admin/login`)<br>- 구글 소셜 로그인이 아닌 **이메일/비밀번호 로그인**<br>- 관리자 계정은 미리 등록된 계정으로 동작 | `signInWithEmailAndPassword(auth, email, password)`, 관리자 Role / Custom Claims 확인 |
| 관리자 | 관리자 레이아웃 | 화면 구성 | - 좌측 사이드바 메뉴 구성: 대시보드, 사용자 관리, 컨텐츠 관리, 로그아웃 | `AdminLayout.jsx` 사이드바 및 서브 라우트 구성 |
| 관리자 | 대시보드 | 통계 요약 | - 가입된 총 사용자 수 표시<br>- 작성된 총 컨텐츠(게시물) 수 표시 | Firestore `getCountFromServer()` 쿼리 |
| 관리자 | 사용자 관리 | 회원 관리 및 차단 | - 전체 회원가입 사용자 리스트 조회<br>- 사용자 정보 수정 및 삭제<br>- **접속 불가(블록/차단) 설정 및 해제** 기능 | - Firestore `users` 문서 `isBlocked: true/false` 필드 관리<br>- 차단된 사용자는 로그인/서비스 이용 제한 Rules 적용 |
| 관리자 | 컨텐츠 관리 | 게시물 모더레이션 | - 작성된 모든 컨텐츠 리스트 확인<br>- 컨텐츠 내용 편집 및 삭제 기능<br>- 특정 컨텐츠 선택 시 등록된 사진/영상 확인 및 개별 미디어 삭제 기능 | Firestore `posts` 문서 편집/삭제 및 Storage 파일 `deleteObject` |
| 관리자 | 컨텐츠 관리 | 댓글 모더레이션 | - 특정 컨텐츠에 등록된 모든 댓글 리스트 표시<br>- 댓글 내용 수정 및 삭제 기능 | Firestore `comments` 문서 편집/삭제 |

---

## 3. 데이터베이스 ERD / 데이터 구조 (Firestore Schema)

```
users (Collection)
 └── {userId} (Document)
      ├── uid: string
      ├── email: string
      ├── nickname: string (unique)
      ├── profileImageUrl: string
      ├── bio: string
      ├── termsAgreed: boolean
      ├── isBlocked: boolean
      └── createdAt: timestamp

posts (Collection)
 └── {postId} (Document)
      ├── authorId: string
      ├── authorNickname: string
      ├── authorProfileUrl: string
      ├── content: string
      ├── images: string[] (최대 4개 URL)
      ├── representativeImageIndex: number (0~3)
      ├── videoUrl: string (선택, 1개)
      ├── tags: string[]
      ├── commentCount: number
      └── createdAt: timestamp

comments (Collection)
 └── {commentId} (Document)
      ├── postId: string
      ├── authorId: string
      ├── authorNickname: string
      ├── authorProfileUrl: string
      ├── text: string
      └── createdAt: timestamp
```

---

## 4. 향후 개발 단계 (Implementation Phases)

1. **Phase 1**: Firebase 프로젝트 연동 및 Authentication (Google OAuth + Admin Email Auth)
2. **Phase 2**: 사용자 회원가입(프로필/약관/닉네임 중복검사) 및 설정 화면 구현
3. **Phase 3**: 메인 피드, 게시물 등록 다이얼로그 (이미지/동영상/태그), 게시물 검색 기능 구현
4. **Phase 4**: 게시물 상세 화면, 미디어 플레이어, 댓글 작성 조건 제어 (1인 1댓글, 본인 게시물 제외)
5. **Phase 5**: 프로필 화면 및 통계(작성 게시물/댓글 수) 구현
6. **Phase 6**: 관리자 레이아웃, 로그인, 대시보드, 회원 관리(차단 포함), 콘텐츠/댓글 모더레이션 구현
