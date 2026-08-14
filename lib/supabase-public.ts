import { createClient } from "@supabase/supabase-js";

/**
 * Public, cookie-free Supabase client for server components that only need
 * to read approved public data. Using this avoids cookies() and keeps the
 * route cacheable (ISR / static).
 */
export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
