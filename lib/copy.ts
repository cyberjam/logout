/**
 * LOGOUT 카피 라이브러리
 *
 * 톤: 무심한 터미널 / 담백한 단정 / 도발이 아니라 "사실의 통보"
 * 원칙:
 * - 경쟁이 아니라 연속성. "1등"이 아니라 "오늘 나갔다".
 * - 운동앱 어휘 금지("화이팅", "최고예요", "응원해요" X)
 * - 게임 어휘 금지("보스", "챔피언", "HIGH SCORE", "STAGE" X)
 * - 한 줄. 짧고 단정적으로.
 *
 * 사용:
 *   import { COPY, randomOf, deterministicOf, fmt } from "@/lib/copy";
 *   randomOf(COPY.todayNotYet)
 */

export const COPY = {
  // === 오늘 아직 안 나감 ===
  todayNotYet: [
    "아직 오늘 로그아웃하지 않았다",
    "You haven't logged out today.",
    "화면을 닫을 시간",
    "한 걸음이면 된다",
    "오늘은 아직 비어 있다",
    "밖은 아직 너를 못 봤다",
  ],

  // === 오늘 나감 ===
  todayDone: [
    "오늘은 밖으로 나갔다",
    "LOGGED OUT",
    "오늘 한 칸 채웠다",
    "오늘도 streak 을 이었다",
    "이 날은 기록에 남았다",
    "한 걸음, 인정",
  ],

  // === streak 유지 권유 ===
  streakAlive: [
    "이 흐름을 이어가라",
    "Keep the streak alive.",
    "끊기지 않게",
    "내일도 한 걸음",
    "연속은 거짓말을 하지 않는다",
  ],

  // === streak 끊김 / 0 ===
  streakZero: [
    "오늘 다시 시작하면 된다",
    "다시 1부터",
    "끊긴 건 다시 잇는다",
    "START AGAIN",
    "한 걸음이면 다시 켜진다",
  ],

  // === 첫 기록 ===
  firstEver: [
    "첫 로그아웃",
    "One step outside counts.",
    "여기서 시작된다",
    "기록의 첫 날",
    "비어 있던 자리에 하루가 찍혔다",
  ],

  // === 기록(방문) 저장 성공 ===
  visitLogged: [
    "오늘이 기록에 남았다",
    "한 걸음, 새겨졌다",
    "LOGGED",
    "밖으로 나간 날 +1",
    "이 날은 사라지지 않는다",
  ],

  // === 빈 기록 / 히스토리 ===
  emptyHistory: [
    "아직 기록이 없다",
    "첫 한 걸음을 남겨보자",
    "여긴 아직 비어 있다",
    "나간 날이 여기 쌓인다",
  ],

  // === 장소 — 아직 아무도 안 옴 ===
  vacantPlace: [
    "아직 아무도 다녀가지 않았다",
    "첫 방문이 여기 남는다",
    "비어 있는 자리",
    "당신이 첫 기록이 된다",
  ],

  // === 태그라인 ===
  tagline: [
    "로그아웃하고, 밖으로",
    "화면을 닫게 만드는 앱",
    "나간 날을 센다",
    "한 걸음이면 된다",
  ],

  // === 브랜드 ===
  brand: {
    kr: "로그아웃",
    en: "LOGOUT",
    tagline: "로그아웃하고, 밖으로",
    full: "LOGOUT — 로그아웃하고, 밖으로",
  },

  // === 짧은 배지 ===
  badges: {
    today: "TODAY",
    new: "NEW",
    streak: "STREAK",
    legacy: "LEGACY",
  },

  // === 시스템 — 에러 ===
  error: [
    "연결이 끊겼다",
    "신호 없음",
    "다시 시도해라",
    "잠깐, 다시",
  ],

  // === 시스템 — 로딩 ===
  loading: [
    "불러오는 중",
    "LOADING...",
    "기록 확인 중",
  ],

  // === 시스템 — 404 ===
  notFound: [
    "여긴 없는 길",
    "PAGE NOT FOUND",
    "지도에 없는 자리",
    "돌아가자",
  ],
} as const;

// === Helpers ===

/** 매번 다른 카피가 필요한 곳에 사용 (예: 토스트) */
export function randomOf<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * 같은 seed → 같은 결과.
 * 새로고침마다 바뀌면 안 되는 곳에 사용.
 * 예: deterministicOf(COPY.vacantPlace, location.id)
 */
export function deterministicOf<T>(list: readonly T[], seed: string | number): T {
  const s = String(seed);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return list[Math.abs(hash) % list.length];
}

/** {nickname} / {days} / {distance} 같은 토큰 치환 */
export function fmt(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}
