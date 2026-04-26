# 건축법령 검색 웹앱 — 배포 가이드

## 파일 구조
```
law-search/
├── api/
│   ├── search.js      ← 법령 목록 검색 (프록시)
│   └── articles.js    ← 조문 상세 조회 (프록시)
├── public/
│   └── index.html     ← 프론트엔드 화면
└── vercel.json        ← Vercel 설정
```

---

## Step 1 — 법제처 API 키 발급 (무료, 5분)

1. https://open.law.go.kr 접속
2. 회원가입 → 로그인
3. 상단 메뉴 [오픈API] → [활용신청]
4. 서비스명 자유 입력 → 신청 → 즉시 발급
5. 발급된 **인증키(OC)** 복사해두기

---

## Step 2 — GitHub에 올리기 (무료)

1. https://github.com 가입 (없으면)
2. 우측 상단 [+] → [New repository]
3. Repository name: `law-search` → [Create repository]
4. 아래 명령어 순서대로 실행 (PC에 Git 설치 필요):

```bash
cd law-search
git init
git add .
git commit -m "첫 배포"
git remote add origin https://github.com/본인아이디/law-search.git
git push -u origin main
```

> Git이 없으면: https://git-scm.com/downloads 에서 설치

---

## Step 3 — Vercel 배포 (무료, 3분)

1. https://vercel.com 접속 → [Sign up with GitHub]으로 가입
2. Dashboard → [Add New Project]
3. GitHub에서 `law-search` 저장소 선택 → [Import]
4. 설정 그대로 두고 [Deploy] 클릭
5. 배포 완료되면 URL 발급됨 (예: `https://law-search-abc123.vercel.app`)

---

## Step 4 — API 키 환경변수 등록

> 코드에 API 키를 직접 쓰면 보안 위험 → 반드시 환경변수로!

1. Vercel Dashboard → 해당 프로젝트 → [Settings] → [Environment Variables]
2. 아래 추가:
   - Key: `LAW_API_KEY`
   - Value: Step 1에서 발급받은 인증키
3. [Save] → 상단 [Deployments] 탭 → 최근 배포 → [Redeploy]

---

## Step 5 — 완료 확인

발급된 Vercel URL로 접속 → 「계단실」 검색 → 법령 목록 나오면 성공!

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| 검색 결과 없음 | API 키 미등록 | Step 4 확인 |
| 서버 오류 500 | API 키 오타 | 환경변수 재확인 |
| 조문이 안 나옴 | 법제처 응답 형식 차이 | 법제처 사이트 전문 보기 링크 활용 |
| 배포 실패 | vercel.json 오류 | 파일 구조 재확인 |
