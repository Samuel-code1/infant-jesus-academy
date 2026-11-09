
import { NextRequest, NextResponse } from "next/server";

import { requireStaffRole } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 50;

const ALLOWED_STATUSES = [
  "pending",
  "under_review",
  "accepted",
  "rejected",
] as const;

const ALLOWED_PROGRAMMES = [
  "Nursery Education",
  "Primary Education",
  "Secondary Education",
] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

function escapeSearchTerm(value: string) {
  return value.replace(/[,%_()]/g, "");
}

export async function GET(request: NextRequest) {
  try {
    // 1. Only the main administrator may access this endpoint.
    await requireStaffRole(["administrator"]);

    // 2. Read and validate query parameters.
    const params = request.nextUrl.searchParams;

    const search = (params.get("search") ?? "").trim();
    const status = params.get("status") ?? "";
    const programme = params.get("programme") ?? "";

    const requestedPage = Number(params.get("page") ?? "1");
    const requestedLimit = Number(
      params.get("limit") ?? String(PAGE_SIZE_DEFAULT)
    );

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      requestedPage > 100000
    ) {
      return jsonError("Invalid page number.", 400);
    }

    if (
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > PAGE_SIZE_MAX
    ) {
      return jsonError(
        `Page size must be between 1 and ${PAGE_SIZE_MAX}.`,
        400
      );
    }

    if (search.length > 150) {
      return jsonError("Search term is too long.", 400);
    }

    if (
      status &&
      !ALLOWED_STATUSES.includes(
        status as (typeof ALLOWED_STATUSES)[number]
      )
    ) {
      return jsonError("Invalid application status.", 400);
    }

    if (
      programme &&
      !ALLOWED_PROGRAMMES.includes(
        programme as (typeof ALLOWED_PROGRAMMES)[number]
      )
    ) {
      return jsonError("Invalid academic programme.", 400);
    }

    // 3. Connect using the server-only service-role client.
    const supabase = createSupabaseServerClient();

    // 4. Select only the fields required for the applications list.
    // Private document paths and privacy metadata are deliberately excluded.
    let query = supabase
      .from("admissions_applications")
      .select(
        `
          id,
          application_reference,
          applicant_name,
          gender,
          date_of_birth,
          parent_name,
          parent_phone,
          programme,
          status,
          created_at
        `,
        { count: "exact" }
      );

    // 5. Apply optional filters.
    if (status) {
      query = query.eq("status", status);
    }

    if (programme) {
      query = query.eq("programme", programme);
    }

    if (search) {
      const safeSearch = escapeSearchTerm(search);

      if (!safeSearch) {
        return NextResponse.json({
          success: true,
          applications: [],
          pagination: {
            page: requestedPage,
            limit: requestedLimit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      query = query.or(
        [
          `applicant_name.ilike.%${safeSearch}%`,
          `application_reference.ilike.%${safeSearch}%`,
          `parent_phone.ilike.%${safeSearch}%`,
        ].join(",")
      );
    }

    // 6. Apply pagination and sorting.
    const from = (requestedPage - 1) * requestedLimit;
    const to = from + requestedLimit - 1;

    const {
      data: applications,
      count,
      error,
    } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
  console.error("Admissions query failed:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  return jsonError(
    "Unable to retrieve admissions applications.",
    500
  );
}

    const total = count ?? 0;

    // 7. Return applications and pagination metadata.
    return NextResponse.json({
      success: true,
      applications: applications ?? [],
      pagination: {
        page: requestedPage,
        limit: requestedLimit,
        total,
        totalPages: Math.ceil(total / requestedLimit),
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
