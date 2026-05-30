<div align="center">

# LOGOUT

### 로그아웃하고, 밖으로

화면을 끄고 철봉 앞에 서는 순간을 만드는 제품.

</div>

---

## ▍철학

LOGOUT 은 운동 기록 앱이 아니다.
**"앱을 닫고 밖으로 나가는 행동"** 자체를 보상하는 제품 레이어다.

- 기록(reps)보다 **출석(방문)** 이 중요하다
- 경쟁보다 **꾸준함(streak)** 이 중요하다
- 첫 화면에서 **3초 안에** "지금 뭘 하면 되는지"가 보여야 한다

> 점령전·문파 같은 게임 엔진 실험은 별도 레포(`gongsjang` / `dev`)에 둔다.
> 이 레포는 **UX · 브랜드 · 화면 흐름** 만 다룬다.

---

## ▍화면 (라우트)

| 경로 | 화면 | 핵심 |
|---|---|---|
| `/` | 홈 (지도) | 3초 UX — 가까운 철봉 · 오늘 할 일 |
| `/qr` | QR 기록 | 현장 QR 스캔 → 방문 인증 *(MVP: 골격)* |
| `/locations/[id]` | 장소 상세 | 기록 · 랭킹 |
| `/locations/[id]/record` | 기록 등록 | reps / streak |
| `/me` | 내 상태 | streak · tier · 방문 수 *(MVP: 골격)* |

CRT / 아케이드 다크 네온 톤 유지 (`app/globals.css`, `tailwind.config.ts`).

---

## ▍빠른 시작

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래)
npm run dev                  # http://localhost:3000
```

### 환경변수 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_KAKAO_MAP_KEY=...     # Kakao JS 키 (도메인 등록)
```

---

## ▍인프라 (gongsjang 과 공유 가능)

- **Supabase**: 동일 DB 공유 가능 (`supabase/schema.sql` 의 `locations`/`records`). LOGOUT 전용 테이블이 필요하면 별도 마이그레이션 추가.
- **Kakao**: 동일 JS 키 사용 가능 (배포 도메인 추가 등록 필요).
- **Vercel**: **별도 프로젝트**로 분리, 환경변수는 이 레포 기준으로 재설정.

자세한 분리/세팅 절차는 `SETUP.md` 참고.

---

## ▍로드맵 (제품화)

- [ ] 홈 3초 UX 확정 (가까운 철봉 + 오늘의 1액션)
- [ ] QR 기록 플로우 (`/qr`)
- [ ] streak / tier 시스템 + `/me` 상태 화면
- [ ] 온보딩 (닉네임 → 첫 방문)
- [ ] 푸시/리마인드 (밖으로 나가게)
