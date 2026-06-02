import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Location, RecordRow, RecordType } from "@/lib/types";
import { RECORD_TYPES } from "@/lib/types";
import RankingTabs from "@/components/RankingTabs";
import CheckInButton from "@/components/CheckInButton";

export const dynamic = "force-dynamic";

export default async function LocationDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { type?: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!location) notFound();
  const loc = location as Location;

  const { data: recordsData } = await supabase
    .from("records")
    .select("*")
    .eq("location_id", params.id);

  const records: RecordRow[] = recordsData ?? [];
  const activeType: RecordType = (RECORD_TYPES.find(
    (t) => t.value === searchParams.type,
  )?.value ?? "pullup") as RecordType;

  const totalChallenges = records.length;

  return (
    <div className="arcade-fade-in space-y-5 px-4 pb-8 pt-3">
      <Link
        href="/locations"
        className="inline-flex items-center gap-1 text-[10px] tracking-arcade text-zinc-500 hover:text-arcade-accent"
      >
        <span>←</span>
        <span>EXIT</span>
      </Link>

      {/* 1. 장소명 — 카드 없이 텍스트로만 */}
      <header className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="arcade-chip border-arcade-border text-zinc-400">
            STAGE
          </span>
          <h1 className="font-display min-w-0 flex-1 truncate text-2xl leading-none text-arcade-accent">
            {loc.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-500">
          {loc.address && (
            <>
              <span className="truncate">{loc.address}</span>
              <span className="text-zinc-700">·</span>
            </>
          )}
          <span>도전자 {totalChallenges}명</span>
        </div>
        {loc.description && (
          <p className="pt-1 text-[11px] leading-relaxed text-zinc-500">
            {loc.description}
          </p>
        )}
      </header>

      {/* 2. LOGOUT 핵심 루프 — GPS 방문 인증 (메인 액션) */}
      <CheckInButton locationId={loc.id} name={loc.name} />

      {/* ── 아래는 Legacy(기록 랭킹) — 유지하되 신규 개발 중단 ── */}
      <div className="flex items-center gap-2 pt-1">
        <span className="arcade-chip border-arcade-border text-zinc-500">LEGACY</span>
        <span className="arcade-label-wide">기록 랭킹</span>
        <span className="h-px flex-1 bg-arcade-border/40" />
      </div>

      {/* TOP3 + 전체 랭킹 (Legacy) */}
      <RankingTabs
        locationId={loc.id}
        records={records}
        activeType={activeType}
      />

      {/* 기록(reps) 등록 — Legacy, 메인 대비 약하게 */}
      <Link
        href={`/locations/${loc.id}/record`}
        className="block w-full rounded border border-arcade-border bg-arcade-panel py-3 text-center text-zinc-300 transition active:translate-y-px hover:border-arcade-accent hover:text-arcade-accent"
      >
        <span className="font-display block text-base leading-none tracking-[0.18em]">
          기록 등록 (reps)
        </span>
        <span className="mt-1 block text-[10px] tracking-arcade text-zinc-500">
          LEGACY · 랭킹 경쟁
        </span>
      </Link>
    </div>
  );
}
