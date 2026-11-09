import { NextRequest, NextResponse } from "next/server";

import { requireStaffRole } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APPLICATION_SELECT = `
  id,
  application_reference,
  applicant_name,
  gender,
  date_of_birth,
  nationality,
  state_of_origin,
  current_address,
  parent_name,
  parent_phone,
  programme,
  previous_school,
  reason_for_leaving,
  passport_photo_path,
  nin_document_path,
  birth_certificate_path,
  status,
  created_at
`;

const ALLOWED_STATUSES = [
  "pending",
  "under_review",
  "accepted",
  "rejected",
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ApplicationStatus = (typeof ALLOWED_STATUSES)[number];

type SafeApplication = {
  id: string;
  application_reference: string;
  applicant_name: string;
  gender: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  state_of_origin: string | null;
  current_address: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  programme: string | null;
  previous_school: string | null;
  reason_for_leaving: string | null;
  status: ApplicationStatus;
  created_at: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

function isValidUUID(value: string) {
  return UUID_REGEX.test(value);
}

function normalizeApplication(
  row: Record<string, unknown>
): SafeApplication {
  const status = row.status;

  return {
    id: String(row.id ?? ""),
    application_reference: String(row.application_reference ?? ""),
    applicant_name: String(row.applicant_name ?? ""),
    gender: typeof row.gender === "string" ? row.gender : null,
    date_of_birth:
      typeof row.date_of_birth === "string" ? row.date_of_birth : null,
    nationality:
      typeof row.nationality === "string" ? row.nationality : null,
    state_of_origin:
      typeof row.state_of_origin === "string" ? row.state_of_origin : null,
    current_address:
      typeof row.current_address === "string" ? row.current_address : null,
    parent_name:
      typeof row.parent_name === "string" ? row.parent_name : null,
    parent_phone:
      typeof row.parent_phone === "string" ? row.parent_phone : null,
    programme: typeof row.programme === "string" ? row.programme : null,
    previous_school:
      typeof row.previous_school === "string" ? row.previous_school : null,
    reason_for_leaving:
      typeof row.reason_for_leaving === "string" ? row.reason_for_leaving : null,
    status:
      typeof status === "string" && ALLOWED_STATUSES.includes(status as ApplicationStatus)
        ? (status as ApplicationStatus)
        : "pending",
    created_at:
      typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
  };
}

function buildDocumentSummary(row: Record<string, unknown>) {
  return {
    passport_photo: {
      available: typeof row.passport_photo_path === "string" && row.passport_photo_path.trim().length > 0,
      label: "Passport photograph",
    },
    nin_document: {
      available: typeof row.nin_document_path === "string" && row.nin_document_path.trim().length > 0,
      label: "NIN document",
    },
    birth_certificate: {
      available:
        typeof row.birth_certificate_path === "string" && row.birth_certificate_path.trim().length > 0,
      label: "Birth certificate",
    },
  };
}

async function getApplicationRecord(supabase: ReturnType<typeof createSupabaseServerClient>, applicationId: string) {
  const { data, error } = await supabase
    .from("admissions_applications")
    .select(APPLICATION_SELECT)
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    return { error, data: null } as const;
  }

  return { error: null, data } as const;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffRole(["administrator"]);

    const { id } = await params;

    if (!isValidUUID(id)) {
      return jsonError("Invalid application ID.", 400);
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await getApplicationRecord(supabase, id);

    if (error) {
      console.error("Admissions details lookup failed:", {
        code: error.code,
        message: error.message,
      });

      return jsonError("Unable to load the application.", 500);
    }

    if (!data) {
      return jsonError("Application not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        application: normalizeApplication(data),
        documents: buildDocumentSummary(data),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Authentication required.", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Administrator access required.", 403);
    }

    return jsonError("An unexpected error occurred.", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffRole(["administrator"]);

    const { id } = await params;

    if (!isValidUUID(id)) {
      return jsonError("Invalid application ID.", 400);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body) || !("status" in body)) {
      return jsonError("Application status is required.", 400);
    }

    const nextStatus = body.status;

    if (
      typeof nextStatus !== "string" ||
      !ALLOWED_STATUSES.includes(nextStatus as ApplicationStatus)
    ) {
      return jsonError("Invalid application status.", 400);
    }

    const supabase = createSupabaseServerClient();
    const existingApplication = await getApplicationRecord(supabase, id);

    if (existingApplication.error) {
      console.error("Admissions status update lookup failed:", {
        code: existingApplication.error.code,
        message: existingApplication.error.message,
      });

      return jsonError("Unable to update the application status.", 500);
    }

    if (!existingApplication.data) {
      return jsonError("Application not found.", 404);
    }

    const { data, error } = await supabase
      .from("admissions_applications")
      .update({ status: nextStatus })
      .eq("id", id)
      .select(APPLICATION_SELECT)
      .maybeSingle();

    if (error) {
      console.error("Admissions status update failed:", {
        code: error.code,
        message: error.message,
      });

      return jsonError("Unable to update the application status.", 500);
    }

    if (!data) {
      return jsonError("Application not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        application: normalizeApplication(data),
        documents: buildDocumentSummary(data),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Authentication required.", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Administrator access required.", 403);
    }

    return jsonError("An unexpected error occurred.", 500);
  }
}
