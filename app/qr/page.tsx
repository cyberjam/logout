"use client";

import { useState } from "react";

// QR 기록 — 골격(MVP). 현장 QR 스캔 → 방문 인증 흐름의 자리.
// 실제 스캐너/GPS/인증은 후속. 지금은 코드 입력 placeholder.
export default function QrPage() {
  const [code, setCode] = useState("");

  return (
    <div className="arcade-fade-in space-y-5 px-4 pb-8 pt-3">
      <h1 className="font-display text-2xl leading-none text-arcade-accent">QR 기록</h1>
      <p className="text-[11px] tracking-arcade text-zinc-500">
        철봉 앞 QR 을 찍어 방문을 인증한다
      </p>

      <div className="arcade-card-feature grid place-items-center gap-3 p-6 text-center">
        <div className="grid h-40 w-40 place-items-center rounded border border-arcade-border bg-arcade-inset text-[10px] tracking-arcade text-zinc-500">
          QR 스캐너 자리
          <br />
          (후속 구현)
        </div>
        <input
          className="arcade-input w-full"
          placeholder="코드 직접 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="arcade-btn-primary font-display w-full py-3 text-lg tracking-[0.18em]">
          ▶ 방문 인증
        </button>
      </div>
    </div>
  );
}
