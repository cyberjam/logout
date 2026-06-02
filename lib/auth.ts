import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

/**
 * 익명 세션 보장 — 없으면 signInAnonymously 로 생성한다.
 * streak 집계에 필요한 안정적 식별자(auth.uid())를 확보한다. 로그인 UI 없음.
 *
 * ⚠️ Supabase 대시보드에서 Authentication → Anonymous sign-ins 활성화가 필요하다.
 *    (SETUP.md 7번 참고)
 */
export async function ensureAnonSession(supabase: BrowserClient) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}
