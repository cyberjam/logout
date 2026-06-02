// LOGOUT 출석/등급 — my_streak() RPC 결과 + tier 계산
// 경쟁(랭킹)이 아니라 "얼마나 자주 밖으로 나갔나"를 다룬다.

export type StreakStats = {
  current_streak: number;
  longest_streak: number;
  total_visits: number;
  distinct_days: number;
  today_visited: boolean;
  last_visit_date: string | null;
};

export const EMPTY_STREAK: StreakStats = {
  current_streak: 0,
  longest_streak: 0,
  total_visits: 0,
  distinct_days: 0,
  today_visited: false,
  last_visit_date: null,
};

// 누적 방문 수 기반 명예 등급 — streak 이 끊겨도 내려가지 않는다.
export type Tier = { name: string; min: number };

export const TIERS: Tier[] = [
  { name: "철린이", min: 0 },
  { name: "산책러", min: 1 },
  { name: "출석러", min: 3 },
  { name: "철벽", min: 7 },
  { name: "고인물", min: 14 },
  { name: "은둔고수", min: 30 },
];

export function tierOf(totalVisits: number): Tier {
  let cur = TIERS[0];
  for (const t of TIERS) if (totalVisits >= t.min) cur = t;
  return cur;
}

export function nextTier(totalVisits: number): Tier | null {
  return TIERS.find((t) => t.min > totalVisits) ?? null;
}
