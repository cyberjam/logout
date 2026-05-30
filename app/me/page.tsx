// 내 상태 — 골격(MVP). streak / tier / 방문 수 자리.
// 실제 집계는 후속(방문 데이터 연동). 지금은 구조만.
export default function MePage() {
  const stats = [
    { label: "연속 출석", value: "—", unit: "일", tone: "text-arcade-neon" },
    { label: "총 방문", value: "—", unit: "회", tone: "text-arcade-accent" },
    { label: "TIER", value: "철린이", unit: "", tone: "text-zinc-200" },
  ];

  return (
    <div className="arcade-fade-in space-y-5 px-4 pb-8 pt-3">
      <header className="space-y-1">
        <span className="arcade-chip border-arcade-border text-zinc-400">ME</span>
        <h1 className="font-display text-3xl leading-none text-arcade-accent">내 상태</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="arcade-stat p-3">
            <div className="arcade-label">{s.label}</div>
            <div className={`font-display text-2xl leading-none tabular-nums ${s.tone}`}>
              {s.value}
              {s.unit && <span className="ml-1 text-[10px] text-zinc-400">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] tracking-arcade text-zinc-500">
        오늘 한 번 더 밖으로 — streak 을 잇자
      </p>
    </div>
  );
}
