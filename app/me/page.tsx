"use client";

// 내 기록 — LOGOUT 핵심 지표. streak / tier / 총 방문 (실데이터).
// 익명 세션 → my_streak() RPC. 경쟁 랭킹이 아니라 "꾸준함"을 보여준다.

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureAnonSession } from "@/lib/auth";
import { EMPTY_STREAK, type StreakStats, tierOf, nextTier } from "@/lib/streak";

export default function MePage() {
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        await ensureAnonSession(supabase);
        const { data, error } = await supabase.rpc("my_streak");
        if (cancelled) return;
        if (error) {
          setError(error.message);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        setStats({ ...EMPTY_STREAK, ...(row ?? {}) });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "불러오기 실패");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = !stats && !error;
  const s = stats ?? EMPTY_STREAK;
  const tier = tierOf(s.total_visits);
  const next = nextTier(s.total_visits);

  return (
    <div className="arcade-fade-in space-y-5 px-4 pb-8 pt-3">
      <header className="space-y-1">
        <span className="arcade-chip border-arcade-border text-zinc-400">ME</span>
        <h1 className="font-display text-3xl leading-none text-arcade-accent">내 기록</h1>
      </header>

      {error && (
        <div className="rounded border border-arcade-danger/40 bg-arcade-danger/10 p-3 text-[11px] text-arcade-danger">
          {error}
          <div className="mt-1 text-zinc-500">
            Supabase 익명 로그인 활성화가 필요할 수 있어요 (SETUP.md 7번).
          </div>
        </div>
      )}

      {/* 연속 출석 — 메인 지표 */}
      <div className="arcade-card-feature arcade-scanlines overflow-hidden p-5 text-center">
        <div className="arcade-label-wide">CURRENT STREAK · 연속 출석</div>
        <div className="arcade-glow-gold font-display mt-2 text-6xl leading-none text-arcade-accent tabular-nums">
          {loading ? "—" : s.current_streak}
          <span className="ml-1 text-lg text-zinc-300">일</span>
        </div>
        <div className="mt-2 text-[11px] tracking-arcade text-zinc-400">
          {loading
            ? "불러오는 중…"
            : s.current_streak === 0
              ? "오늘 밖으로 나가 streak 을 시작하자"
              : s.today_visited
                ? "오늘 출석 완료 — 내일 또 이어가자"
                : "오늘 아직 — 나가야 streak 이 유지된다"}
        </div>
      </div>

      {/* 보조 지표 */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="총 방문" value={loading ? "—" : String(s.total_visits)} unit="회" tone="text-arcade-neon" />
        <Stat label="최장 STREAK" value={loading ? "—" : String(s.longest_streak)} unit="일" tone="text-zinc-200" />
        <Stat label="TIER" value={loading ? "—" : tier.name} unit="" tone="text-arcade-accent" />
      </div>

      {/* 다음 등급 안내 */}
      {!loading && !error && next && (
        <p className="text-center text-[11px] tracking-arcade text-zinc-500">
          다음 등급 <span className="text-arcade-accent">{next.name}</span> 까지 {next.min - s.total_visits}회
        </p>
      )}

      <div className="text-center">
        <Link
          href="/"
          className="arcade-btn-ghost inline-flex px-4 py-2 text-xs tracking-arcade"
        >
          ▶ 가까운 철봉 찾기
        </Link>
      </div>
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
  value: string;
  unit: string;
  tone: string;
}) {
  return (
    <div className="arcade-stat p-3">
      <div className="arcade-label">{label}</div>
      <div className={`font-display mt-0.5 text-2xl leading-none tabular-nums ${tone}`}>
        {value}
        {unit && <span className="ml-1 text-[10px] text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
}
