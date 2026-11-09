
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseSessionClient } from "@/lib/supabase/session";

export async function POST(request: NextRequest) {
  // Reject requests originating from another website.
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 }
    );
  }

  try {
    const supabase = await createSupabaseSessionClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: "Unable to sign out. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during sign out." },
      { status: 500 }
    );
  }
}
