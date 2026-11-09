import { NextResponse } from "next/server";

import { requireStaffRole } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = [
  "pending",
  "under_review",
  "accepted",
  "rejected",
] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export async function GET() {
  try {
    // Only the main administrator can access these statistics.
    await requireStaffRole(["administrator"]);

    const supabase = createSupabaseServerClient();

    // Count all applications without retrieving applicant records.
    const totalQuery = supabase
      .from("admissions_applications")
      .select("id", { count: "exact", head: true });

    // Count each application status independently.
    const statusQueries = STATUSES.map((status) =>
      supabase
        .from("admissions_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", status)
    );

    const [totalResult, ...statusResults] = await Promise.all([
      totalQuery,
      ...statusQueries,
    ]);

    if (
  totalResult.error ||
  statusResults.some((result) => result.error)
) {
  console.error("Admissions statistics query failed:", {
    totalError: totalResult.error,
    statusErrors: statusResults
      .filter((result) => result.error)
      .map((result) => result.error),
  });

  return jsonError(
    "Unable to retrieve admissions statistics.",
    500
  );
}

    const counts = Object.fromEntries(
      STATUSES.map((status, index) => [
        status,
        statusResults[index].count ?? 0,
      ])
    );

    return NextResponse.json({
      success: true,
      statistics: {
        total: totalResult.count ?? 0,
        ...counts,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return jsonError("Authentication required.", 401);
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return jsonError("Administrator access required.", 403);
    }

    return jsonError(
      "An unexpected error occurred.",
      500
    );
  }
}