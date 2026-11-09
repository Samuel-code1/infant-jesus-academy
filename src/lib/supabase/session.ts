
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { sanitizeSupabaseUrl } from "./config";

export async function createSupabaseSessionClient() {
  const cookieStore = await cookies();

  const supabaseUrl = sanitizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL
  );

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseAnonKey?.trim()) {
    throw new Error(
      "Missing Supabase public key. Check your .env.local configuration."
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey.trim(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes may be unavailable in Server Components.
            // Route handlers and Server Actions can update the session.
          }
        },
      },
    }
  );
}
