<div align="center">

# LOGOUT

### 로그아웃하고, 밖으로

세상에서 가장 빨리 닫히길 바라는 앱.

</div>

---

## ▍이 앱은 당신이 오래 머물면 진다

대부분의 앱은 당신을 화면 안에 더 오래 붙잡으려 한다.
체류 시간, 알림, 무한 스크롤 — 전부 "한 번 더 열게" 만드는 장치다.

**LOGOUT 은 반대다.**

이 앱의 목표는 단 하나, 당신을 **화면 밖 철봉 앞에 세우는 것**.
지도를 열고, 가장 가까운 철봉을 확인하고, 앱을 닫고 — 나간다.
그 다음은 앱이 할 일이 아니라, 당신과 철봉이 할 일이다.

> 그래서 이 앱이 가장 잘 작동한 순간은,
> 당신이 이 앱을 보고 있지 않은 순간이다.

---

## ▍무엇을 보상하는가

운동 앱은 보통 **얼마나 많이 했는지**(reps)를 센다.
LOGOUT 은 **얼마나 자주 나갔는지**(방문)를 센다.

| 흔한 운동 앱 | LOGOUT |
|---|---|
| 기록(reps)이 주인공 | **출석(방문)** 이 주인공 |
| 1등과의 경쟁 | **어제의 나와의 연속(streak)** |
| 화려한 대시보드 | **3초 안에** "지금 뭘 하면 되는지" |

응원 메시지도, 화이팅도 없다.
오늘 한 번 더 밖으로 나갔다는 사실 — 그것만 기록에 남는다.

---

## ▍화면

| 경로 | 화면 | 핵심 |
|---|---|---|
| `/` | 홈 (지도) | 3초 UX — 가까운 철봉 · 오늘 할 일 한 가지 |
| `/qr` | QR 기록 | 현장 QR 스캔 → 방문 인증 *(MVP: 골격)* |
| `/locations/[id]` | 장소 상세 | 기록 · 랭킹 |
| `/locations/[id]/record` | 기록 등록 | reps / streak |
| `/me` | 내 상태 | streak · tier · 방문 수 *(MVP: 골격)* |

다크 + 네온, 모노스페이스, CRT 스캔라인. 오락실 점수판 톤을 그대로 가져왔다.
보는 데 1초, 나가는 데 3초 — 모바일 우선.

> 점령전·문파 같은 게임 엔진 실험은 별도 레포(`gongsjang`)에 둔다.
> 이 레포는 **UX · 브랜드 · 화면 흐름** 만 다룬다.

<br />

<div align="center">

— 여기서부터는 만드는 사람을 위한 이야기 —

</div>

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

## ▍스택

Next.js 14 (App Router) · TypeScript · TailwindCSS ·
Supabase (Postgres + RLS) · Kakao Maps JS SDK

---

## ▍인프라 (gongsjang 과 공유 가능)

- **Supabase**: 동일 DB 공유 가능 (`supabase/schema.sql` 의 `locations`/`records`). LOGOUT 전용 테이블이 필요하면 별도 마이그레이션 추가.
- **Kakao**: 동일 JS 키 사용 가능 (배포 도메인 추가 등록 필요).
- **Vercel**: **별도 프로젝트**로 분리, 환경변수는 이 레포 기준으로 재설정.

자세한 분리/세팅 절차는 [`SETUP.md`](./SETUP.md) 참고.

---

## ▍로드맵 (제품화)

- [ ] 홈 3초 UX 확정 (가까운 철봉 + 오늘의 1액션)
- [ ] QR 기록 플로우 (`/qr`)
- [ ] streak / tier 시스템 + `/me` 상태 화면
- [ ] 온보딩 (닉네임 → 첫 방문)
- [ ] 푸시/리마인드 (밖으로 나가게)

<div align="center">
<br />

**LOGOUT** · 로그아웃하고, 밖으로

</div>
