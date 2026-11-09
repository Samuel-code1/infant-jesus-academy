export function sanitizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Missing Supabase URL environment variable.");
  }

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    throw new Error("Supabase URL environment variable is empty.");
  }

  const withoutTrailingSlash = trimmedUrl.replace(/\/+$/, "");
  const withoutRestSuffix = withoutTrailingSlash.replace(/\/rest\/v1$/i, "");
  const normalizedUrl = withoutRestSuffix.replace(/\/+$/, "");

  try {
    const parsedUrl = new URL(normalizedUrl);

    if (!parsedUrl.protocol || !parsedUrl.hostname) {
      throw new Error("Invalid Supabase URL.");
    }

    const remainingPath = parsedUrl.pathname.replace(/\/+$/, "");
    if (remainingPath && remainingPath !== "/") {
      throw new Error("Invalid Supabase URL path.");
    }

    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch {
    throw new Error(
      `Invalid Supabase URL: "${trimmedUrl}". Expected a project URL like https://<project>.supabase.co`
    );
  }
}
