/**
 * LOGOUT — 방문(visit) streak 계산
 *
 * 철학: 횟수(reps)가 아니라 "밖으로 나간 날"을 센다.
 *
 * 현재 데이터 한계:
 *   visit 전용 테이블/계정이 없어, records(닉네임 + created_at)를 방문 신호로 사용한다.
 *   "오늘 기록을 남겼다 = 오늘 밖으로 나갔다" 로 본다.
 *   같은 날 여러 번 기록해도 하루 1방문으로 집계한다.
 *
 * 모든 "하루" 경계는 KST(UTC+9) 기준이다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 시각 → KST 기준 날짜 키 (YYYY-MM-DD) */
export function kstDayKey(iso: string | number | Date): string {
  const ms = new Date(iso).getTime() + KST_OFFSET_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

/** YYYY-MM-DD → 연속성 비교용 정수 일자 인덱스 */
function dayNum(key: string): number {
  return Math.round(Date.parse(`${key}T00:00:00Z`) / 86_400_000);
}

export type VisitStats = {
  /** KST 오늘 방문(기록) 했는가 */
  visitedToday: boolean;
  /** 현재 연속 일수 (오늘 또는 어제까지 이어질 때만 유효, 끊겼으면 0) */
  currentStreak: number;
  /** 역대 최장 연속 일수 */
  longestStreak: number;
  /** 방문한 '날'의 수 (중복 제거) */
  totalVisits: number;
  /** 원본 기록 수 */
  totalLogs: number;
};

const EMPTY: VisitStats = {
  visitedToday: false,
  currentStreak: 0,
  longestStreak: 0,
  totalVisits: 0,
  totalLogs: 0,
};

/**
 * 방문 시각 목록(records.created_at)으로 streak 통계를 계산한다.
 * @param timestamps ISO 문자열 배열 (정렬 무관)
 * @param now        기준 시각 (테스트용; 기본 현재)
 */
export function computeVisitStats(
  timestamps: string[],
  now: number = Date.now(),
): VisitStats {
  const totalLogs = timestamps.length;
  if (totalLogs === 0) return EMPTY;

  const dayKeys = Array.from(new Set(timestamps.map(kstDayKey)));
  const nums = dayKeys.map(dayNum).sort((a, b) => a - b);
  const today = dayNum(kstDayKey(now));

  // 역대 최장 연속
  let longest = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // 현재 streak — 가장 최근 방문일이 오늘/어제일 때만 살아있음
  const latest = nums[nums.length - 1];
  let current = 0;
  if (latest === today || latest === today - 1) {
    current = 1;
    for (let i = nums.length - 1; i > 0; i--) {
      if (nums[i] === nums[i - 1] + 1) current++;
      else break;
    }
  }

  return {
    visitedToday: latest === today,
    currentStreak: current,
    longestStreak: longest,
    totalVisits: dayKeys.length,
    totalLogs,
  };
}
