
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { sanitizeSupabaseUrl } from "./config";

export function createSupabaseBrowserSessionClient() {
  const supabaseUrl = sanitizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseAnonKey?.trim()) {
    throw new Error(
      "Missing Supabase public key. Check your .env.local configuration."
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey.trim()
  );
}
