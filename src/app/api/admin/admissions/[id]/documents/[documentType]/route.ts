import { NextRequest, NextResponse } from "next/server";

import { requireStaffRole } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOCUMENT_FIELDS = {
  passport_photo: "passport_photo_path",
  nin_document: "nin_document_path",
  birth_certificate: "birth_certificate_path",
} as const;

type DocumentPathField =
  (typeof DOCUMENT_FIELDS)[keyof typeof DOCUMENT_FIELDS];

type AdmissionDocumentRow = Partial<Record<DocumentPathField, string | null>>;

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentType: string }> }
) {
  try {
    await requireStaffRole(["administrator"]);

    const { id, documentType } = await params;

    if (!UUID_REGEX.test(id)) {
      return jsonError("Invalid application ID.", 400);
    }

    const allowedKey = documentType as keyof typeof DOCUMENT_FIELDS;

    if (!(allowedKey in DOCUMENT_FIELDS)) {
      return jsonError("Unsupported document type.", 400);
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("admissions_applications")
      .select(`id, ${DOCUMENT_FIELDS[allowedKey]}`)
      .eq("id", id)
      .maybeSingle<AdmissionDocumentRow>();

    if (error) {
      console.error("Admissions document lookup failed:", {
        code: error.code,
        message: error.message,
      });

      return jsonError("Unable to load the requested document.", 500);
    }

    if (!data) {
      return jsonError("Application not found.", 404);
    }

    const selectedField = DOCUMENT_FIELDS[allowedKey];
    const storagePath = data[selectedField];

    if (typeof storagePath !== "string" || storagePath.trim().length === 0) {
      return jsonError("Document not found.", 404);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("admissions-private")
      .createSignedUrl(storagePath, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return jsonError("Document is unavailable.", 404);
    }

    return NextResponse.redirect(signedUrlData.signedUrl, 302);
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
