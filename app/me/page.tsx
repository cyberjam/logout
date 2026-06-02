"use client";

// 내 상태 — LOGOUT 핵심 화면.
// records(닉네임 + created_at)를 "방문 신호"로 읽어 streak / 총 방문을 KST 기준 집계한다.
// 계정/visit 테이블이 없는 현재 데이터 한계 안에서 구현 (DB 변경 없음).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { computeVisitStats, kstDayKey, type VisitStats } from "@/lib/streak";
import { COPY, randomOf } from "@/lib/copy";
import { RECORD_TYPE_LABEL, RECORD_TYPE_UNIT, type RecordType } from "@/lib/types";

const NICKNAME_KEY = "gongsjang_nickname";

type Activity = {
  created_at: string;
  record_type: RecordType;
  value: number;
  locationName: string | null;
};

function fmtDay(key: string) {
  // key: YYYY-MM-DD
  const [, m, d] = key.split("-");
  return `${m}.${d}`;
}

export default function MePage() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [recent, setRecent] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nick = localStorage.getItem(NICKNAME_KEY);
    setNickname(nick);
    if (!nick) {
      setLoading(false);
      return;
    }
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("records")
        .select("created_at, record_type, value, locations(name)")
        .eq("nickname", nick)
        .order("created_at", { ascending: false });
      const rows = (data ?? []) as any[];
      setStats(computeVisitStats(rows.map((r) => r.created_at)));
      setRecent(
        rows.slice(0, 12).map((r) => ({
          created_at: r.created_at,
          record_type: r.record_type,
          value: r.value,
          locationName: r.locations?.name ?? null,
        })),
      );
      setLoading(false);
    })();
  }, []);

  const visitedToday = stats?.visitedToday ?? false;
  const todayLine = useMemo(
    () => randomOf(visitedToday ? COPY.todayDone : COPY.todayNotYet),
    [visitedToday],
  );
  const subLine = useMemo(
    () =>
      randomOf(
        (stats?.currentStreak ?? 0) > 0 ? COPY.streakAlive : COPY.streakZero,
      ),
    [stats?.currentStreak],
  );

  return (
    <div className="arcade-fade-in space-y-5 px-4 pb-8 pt-3">
      <header className="space-y-1">
        <span className="arcade-chip border-arcade-border text-zinc-400">ME</span>
        <h1 className="font-display text-3xl leading-none text-arcade-accent">
          내 상태
        </h1>
        {nickname && (
          <div className="text-[11px] tracking-arcade text-zinc-500">
            {nickname}
          </div>
        )}
      </header>

      {loading ? (
        <div className="arcade-card p-6 text-center text-[11px] tracking-arcade text-zinc-500">
          {randomOf(COPY.loading)}
        </div>
      ) : !nickname ? (
        <EmptyState />
      ) : (
        <>
          {/* 오늘 상태 배너 — 가장 먼저 보이는 정보 */}
          <div
            className="arcade-card-feature relative overflow-hidden px-4 py-5 text-center"
            data-done={visitedToday}
          >
            <div className="arcade-label-wide">TODAY</div>
            <div
              className={`font-display mt-2 text-2xl leading-tight ${
                visitedToday ? "text-arcade-neon" : "text-arcade-accent"
              }`}
            >
              {todayLine}
            </div>
            <div className="mt-2 text-[11px] tracking-arcade text-zinc-500">
              {subLine}
            </div>
          </div>

          {/* streak / 방문 집계 */}
          <div className="grid grid-cols-3 gap-2">
            <Stat
              label="CURRENT STREAK"
              value={stats?.currentStreak ?? 0}
              unit="일"
              tone="text-arcade-neon"
            />
            <Stat
              label="LONGEST"
              value={stats?.longestStreak ?? 0}
              unit="일"
              tone="text-arcade-accent"
            />
            <Stat
              label="TOTAL VISITS"
              value={stats?.totalVisits ?? 0}
              unit="일"
              tone="text-zinc-200"
            />
          </div>

          {/* 최근 활동 */}
          <section className="space-y-2">
            <header className="flex items-center justify-between px-1">
              <span className="arcade-label-wide">RECENT</span>
              <span className="arcade-label-wide">최근 기록</span>
            </header>
            {recent.length === 0 ? (
              <div className="arcade-card px-3 py-6 text-center text-[11px] text-zinc-500">
                {randomOf(COPY.emptyHistory)}
              </div>
            ) : (
              <ul className="overflow-hidden rounded border border-arcade-border">
                {recent.map((a, i) => (
                  <li
                    key={`${a.created_at}-${i}`}
                    className="flex items-center gap-3 border-b border-arcade-border/30 bg-arcade-panel/40 px-3 py-2.5 last:border-b-0"
                  >
                    <span className="font-display w-12 shrink-0 text-sm leading-none tabular-nums text-arcade-accent">
                      {fmtDay(kstDayKey(a.created_at))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-zinc-300">
                      {a.locationName ?? "어딘가의 철봉"}
                    </span>
                    <span className="shrink-0 text-[10px] tracking-arcade text-zinc-500">
                      {RECORD_TYPE_LABEL[a.record_type]} {a.value}
                      {RECORD_TYPE_UNIT[a.record_type]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Link
            href="/"
            className="arcade-btn-ghost block w-full py-3 text-center text-sm tracking-arcade"
          >
            ▶ 지도에서 가까운 철봉 보기
          </Link>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone: string;
}) {
  return (
    <div className="arcade-stat p-3">
      <div className="arcade-label">{label}</div>
      <div className={`font-display text-2xl leading-none tabular-nums ${tone}`}>
        {value}
        {unit && <span className="ml-1 text-[10px] text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="arcade-card-feature space-y-3 px-4 py-7 text-center">
      <div className="arcade-label-wide">TODAY</div>
      <div className="font-display text-2xl leading-tight text-arcade-accent">
        {COPY.todayNotYet[0]}
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-500">
        아직 기록이 없다.
        <br />
        가까운 철봉에서 첫 한 걸음을 남기면, 여기 streak 이 쌓인다.
      </p>
      <Link
        href="/"
        className="arcade-btn-primary font-display mt-1 inline-block px-5 py-2.5 text-sm tracking-arcade"
      >
        ▶ 지도 열기
      </Link>
    </div>
  );
}
