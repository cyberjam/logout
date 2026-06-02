import KakaoMap from "@/components/KakaoMap";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Location, LocationWithStats, RecordRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const [{ data: locations, error }, { data: records }, { count: stagesCount }] =
    await Promise.all([
      supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("records")
        .select("location_id, record_type, value, nickname, created_at"),
      supabase.from("locations").select("*", { count: "exact", head: true }),
    ]);

  console.log(`[home] locations total count = ${stagesCount ?? "?"}`);

  if (error) {
    return (
      <div className="p-4 text-sm text-arcade-danger">
        장소를 불러오지 못했습니다: {error.message}
      </div>
    );
  }

  const byLocation = new Map<string, Pick<RecordRow, "record_type" | "value" | "nickname">[]>();
  (records ?? []).forEach((r: any) => {
    const list = byLocation.get(r.location_id) ?? [];
    list.push({ record_type: r.record_type, value: r.value, nickname: r.nickname });
    byLocation.set(r.location_id, list);
  });

  const enriched: LocationWithStats[] = (locations ?? []).map((loc: Location) => {
    const rs = byLocation.get(loc.id) ?? [];
    const pullups = rs.filter((r) => r.record_type === "pullup");
    const top = pullups.length
      ? pullups.reduce((a, b) => (a.value >= b.value ? a : b))
      : null;
    return {
      ...loc,
      recordCount: rs.length,
      topPullup: top ? { value: top.value, nickname: top.nickname } : null,
    };
  });

  // TODAY HUD용 — 닉네임별 방문 신호 (클라이언트에서 내 것만 필터)
  const visits: { nickname: string; created_at: string }[] = (records ?? []).map(
    (r: any) => ({ nickname: r.nickname, created_at: r.created_at }),
  );

  return (
    <KakaoMap
      locations={enriched}
      stagesCount={stagesCount ?? enriched.length}
      visits={visits}
    />
  );
}
