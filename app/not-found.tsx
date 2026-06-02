import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="arcade-title font-display text-5xl leading-none text-arcade-accent">
        여긴 없는 길
      </div>
      <p className="mt-2 text-sm text-zinc-400">지도에 없는 자리예요.</p>
      <Link
        href="/"
        className="mt-6 rounded border border-arcade-accent px-4 py-2 text-xs text-arcade-accent hover:bg-arcade-accent hover:text-arcade-bg"
      >
        ▶ 지도로
      </Link>
    </div>
  );
}
