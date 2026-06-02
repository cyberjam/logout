# LOGOUT — 분리/세팅 절차

`gongsjang`(기능 엔진) 과 **완전히 분리된** 제품 레포로 띄우는 절차.
아래 ⚙️ 표시는 **사람이 직접** 해야 하는 부분(자동화 불가).

## 1. 새 GitHub 레포 생성 ⚙️
1. GitHub 에서 빈 레포 `logout` 생성 (private 권장)
2. 이 스타터 압축을 푼 폴더에서:
   ```bash
   git init && git add -A && git commit -m "init: LOGOUT 스타터"
   git branch -M main
   git remote add origin https://github.com/cyberjam/logout.git
   git push -u origin main
   ```

## 2. Vercel 새 프로젝트 ⚙️
1. Vercel → New Project → `logout` 레포 Import
2. Framework: Next.js (자동 감지)
3. **Environment Variables** 등록 (Production/Preview/Development 모두):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_KAKAO_MAP_KEY`
   > `NEXT_PUBLIC_*` 는 빌드 inline → 값 변경 시 재배포 필요
4. 배포 후 도메인 확인

## 3. Kakao ⚙️
- 기존 JS 키 재사용 가능. **Kakao Developers → 플랫폼 → Web** 에 LOGOUT 배포 도메인 추가 등록(미등록 시 지도 로드 실패).

## 4. Supabase (공유 vs 분리) ⚙️
- **공유**: 같은 프로젝트의 `locations`/`records` 를 그대로 사용. anon key 만 넣으면 끝.
- **분리**: 새 Supabase 프로젝트 생성 → `supabase/schema.sql` 실행 → 새 URL/anon key 사용.
- RLS: 현재 정책은 `locations`/`records` **읽기 전체 허용 + 익명 insert 허용**(MVP). LOGOUT 가 쓰기 하면 동일 정책이면 동작. 별도 테이블(streak 등) 추가 시 해당 테이블 RLS 정책도 추가.

## 5. 로컬 실행
```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev
```

## 6. 직접 옮겨야 할 수 있는 것 (선택)
- `gongsjang` 의 `lib/copy.ts` 카피 라이브러리는 포함됨. 추가 카피 필요 시 거기서 가져오기.
- 시드(전국 철봉 데이터) 가 필요하면 `gongsjang` 의 `scripts/` 파이프라인으로 **gongsjang 쪽에서** 채우고 같은 DB 를 공유하면 됨(LOGOUT 에 시드 코드 복제 불필요).

## 7. LOGOUT 핵심 루프 (방문·streak) 활성화 ⚙️
방문 인증 → streak → `/me` 가 동작하려면 두 가지가 필요하다.

1. **스키마 적용**: `supabase/schema.sql` 을 SQL Editor 에서 실행
   - Legacy `locations`/`records` + LOGOUT `visits` 테이블, `record_visit()` / `my_streak()` 함수가 생성된다.
2. **익명 인증 활성화 ⚙️**: Supabase → **Authentication → Sign In / Providers → Anonymous sign-ins** 켜기
   - 식별자(`auth.uid()`)가 있어야 출석/streak 집계가 된다. 로그인 UI 없이 자동 생성.
3. (확인) 방문 인증은 철봉 **100m 반경**에서만 성공한다(서버 거리 검증). 테스트 시 좌표가 가까운지 확인.

## 포함 / 제외
- 포함: 홈(지도)·**GPS 방문 인증(CHECK-IN)**·**streak/`me` 실데이터**·CRT UI
- Legacy(유지, 신규개발 중단): 기록(reps)·랭킹·`/qr` 골격
- 제외: faction/점령/게임 엔진, 시드 스크립트, 엔진용 테스트/메모
