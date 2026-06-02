"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureAnonSession } from "@/lib/auth";

// Legacy 기록 폼과 닉네임 공유 (방문에 표시용 — 선택)
const NICKNAME_KEY = "logout_nickname";

type Phase = "idle" | "locating" | "checking" | "done" | "error";

export default function CheckInButton({
  locationId,
  name,
}: {
  locationId: string;
  name: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("이 기기는 위치 정보를 지원하지 않아요."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
      });
    });
  }

  async function checkIn() {
    setMessage(null);
    setStreak(null);
    try {
      setPhase("locating");
      const pos = await getPosition();

      setPhase("checking");
      const supabase = createSupabaseBrowserClient();
      await ensureAnonSession(supabase);

      const nickname =
        (typeof window !== "undefined" &&
          localStorage.getItem(NICKNAME_KEY)?.trim()) ||
        null;

      const { error } = await supabase.rpc("record_visit", {
        in_location_id: locationId,
        in_lat: pos.coords.latitude,
        in_lng: pos.coords.longitude,
        in_nickname: nickname,
        in_radius_m: 100,
      });

      if (error) {
        const m = error.message ?? "";
        if (m.includes("TOO_FAR")) {
          const dist = m.split("TOO_FAR:")[1]?.trim();
          setPhase("error");
          setMessage(
            dist
              ? `너무 멀어요 — 약 ${dist}m. 철봉 100m 안에서 인증돼요.`
              : "철봉에서 너무 멀어요. 100m 안에서 인증돼요.",
          );
          return;
        }
        if (m.includes("AUTH_REQUIRED")) {
          setPhase("error");
          setMessage("세션 생성 실패 — 잠시 후 다시 시도해주세요.");
          return;
        }
        setPhase("error");
        setMessage(m || "기록 실패. 다시 시도해주세요.");
        return;
      }

      // streak 갱신값 조회
      const { data: stats } = await supabase.rpc("my_streak");
      const row = Array.isArray(stats) ? stats[0] : stats;
      const cur = row?.current_streak;
      setStreak(typeof cur === "number" ? cur : null);
      setPhase("done");
    } catch (e: any) {
      setPhase("error");
      if (e?.code === 1 || /denied|permission/i.test(e?.message ?? "")) {
        setMessage("위치 권한이 필요해요. 허용 후 다시 시도해주세요.");
      } else if (e?.code === 3 || /timeout/i.test(e?.message ?? "")) {
        setMessage("위치 확인 시간 초과 — 다시 시도해주세요.");
      } else {
        setMessage(e?.message ?? "오류가 발생했어요.");
      }
    }
  }

  if (phase === "done") {
    return (
      <div className="arcade-card-feature arcade-scanlines overflow-hidden p-4 text-center">
        <div className="font-display text-base leading-none tracking-[0.16em] text-arcade-neon">
          ✓ CHECK-IN COMPLETE
        </div>
        <div className="mt-2 text-[11px] tracking-arcade text-zinc-400">
          {name} 에 다녀간 기록을 남겼다
        </div>
        {streak != null && (
          <div className="mt-4">
            <div className="arcade-label-wide">CURRENT STREAK</div>
            <div className="arcade-glow-neon font-display mt-1 text-5xl leading-none text-arcade-neon tabular-nums">
              {streak}
              <span className="ml-1 text-sm text-zinc-300">일</span>
            </div>
          </div>
        )}
        <Link
          href="/me"
          className="arcade-btn-ghost mt-4 inline-flex px-4 py-2 text-xs tracking-arcade"
        >
          내 기록 보기 ▸
        </Link>
      </div>
    );
  }

  const busy = phase === "locating" || phase === "checking";
  const label =
    phase === "locating"
      ? "위치 확인 중…"
      : phase === "checking"
        ? "인증 중…"
        : "▶ 방문 인증 (CHECK-IN)";

  return (
    <div>
      <button
        onClick={checkIn}
        disabled={busy}
        className="arcade-btn-primary font-display w-full py-3 text-lg leading-none tracking-[0.18em]"
      >
        {label}
      </button>
      <p className="mt-2 text-center text-[10px] tracking-arcade text-zinc-500">
        철봉 100m 안에서 GPS로 방문을 인증한다
      </p>
      {phase === "error" && message && (
        <div className="mt-2 rounded border border-arcade-danger/40 bg-arcade-danger/10 p-2 text-center text-[11px] text-arcade-danger">
          {message}
        </div>
      )}
    </div>
  );
}
