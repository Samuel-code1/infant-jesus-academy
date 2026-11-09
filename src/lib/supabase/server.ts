import "server-only";

import { createClient } from "@supabase/supabase-js";

import { sanitizeSupabaseUrl } from "./config";

export function createSupabaseServerClient() {
  const supabaseUrl = sanitizeSupabaseUrl(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_KEY;

  if (!serviceRoleKey?.trim()) {
    throw new Error(
      "Supabase service-role key is missing. Check .env.local."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
