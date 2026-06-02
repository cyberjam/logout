import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { VT323 } from "next/font/google";
import "./globals.css";

const fontDisplay = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LOGOUT — 로그아웃하고, 밖으로",
    template: "%s · LOGOUT",
  },
  description:
    "LOGOUT — 화면을 닫고 밖으로. 운동 횟수가 아니라, 밖으로 나간 날을 센다.",
  applicationName: "LOGOUT",
  openGraph: {
    title: "LOGOUT — 로그아웃하고, 밖으로",
    description: "오늘 한 번 더 밖으로. 나간 날을 잇는다.",
    siteName: "LOGOUT",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={fontDisplay.variable}>
      <body className="min-h-screen bg-arcade-bg text-zinc-100">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <header className="sticky top-0 z-20 border-b border-arcade-border bg-arcade-bg/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3">
              <Link
                href="/"
                aria-label="LOGOUT — 로그아웃하고, 밖으로"
                className="group inline-flex items-baseline gap-2"
              >
                <span className="arcade-title font-display text-2xl leading-none text-arcade-accent">
                  LOGOUT
                </span>
                <span className="text-[10px] leading-none tracking-[0.1em] text-zinc-500 group-hover:text-arcade-accent">
                  밖으로
                </span>
              </Link>
              <nav className="flex gap-3 text-xs tracking-arcade">
                <Link href="/" className="hover:text-arcade-accent">지도</Link>
                <Link href="/me" className="hover:text-arcade-accent">내 상태</Link>
                <Link href="/locations" className="hover:text-arcade-accent">장소</Link>
              </nav>
            </div>
            <div className="border-t border-arcade-border/60 px-4 py-1 text-[9px] tracking-arcade-wide text-zinc-500">
              로그아웃하고, 밖으로 · 나간 날을 센다
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-arcade-border px-4 py-4 text-center text-[10px] tracking-arcade text-zinc-500">
            LOG OUT · 밖으로
          </footer>
        </div>
      </body>
    </html>
  );
}
