
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET = "admissions-private";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_BODY_SIZE = 32 * 1024;
const PRIVACY_NOTICE_VERSION = "2026-10-30";
const SCHOOL_TIME_ZONE = "Africa/Lagos";

const ALLOWED_PROGRAMMES = new Set([
  "Nursery Education",
  "Primary Education",
  "Secondary Education",
]);

const ALLOWED_GENDERS = new Set(["Female", "Male", "Other"]);

type FileExtension = "jpg" | "png" | "pdf";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Returns today's calendar date in the school's local time zone.
 * Uses formatToParts to avoid relying on locale-specific date ordering.
 */
function getSchoolLocalDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the school's local date.");
  }

  return `${year}-${month}-${day}`;
}

function getSchoolLocalYear(): string {
  return getSchoolLocalDate().slice(0, 4);
}

function isValidDateOfBirth(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  // Reject impossible calendar dates such as February 31.
  if (date.toISOString().slice(0, 10) !== value) {
    return false;
  }

  // Compare against the current date in Nigeria, not UTC.
  return value <= getSchoolLocalDate();
}

function detectSignature(bytes: Uint8Array): FileExtension | null {
  // JPEG: FF D8 FF
  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  if (isJpeg) return "jpg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (isPng) return "png";

  // PDF: %PDF- (25 50 44 46 2D)
  const isPdf =
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;

  if (isPdf) return "pdf";

  return null;
}

function parseAndValidatePath(
  path: unknown,
  applicationId: string,
  expectedDoc: "passport" | "nin" | "birth-certificate",
): { ok: true; path: string; extension: FileExtension } | { ok: false } {
  if (typeof path !== "string") {
    return { ok: false };
  }

  // Reject directory traversal sequences and backslashes.
  if (path.includes("..") || path.includes("\\") || path.includes("//")) {
    return { ok: false };
  }

  const parts = path.split("/");

  if (parts.length !== 2) {
    return { ok: false };
  }

  const [folder, filename] = parts;

  if (folder.toLowerCase() !== applicationId.toLowerCase()) {
    return { ok: false };
  }

  if (expectedDoc === "passport") {
    if (filename === "passport.jpg") {
      return { ok: true, path, extension: "jpg" };
    }

    if (filename === "passport.png") {
      return { ok: true, path, extension: "png" };
    }

    return { ok: false };
  }

  if (expectedDoc === "nin") {
    if (filename === "nin.jpg") {
      return { ok: true, path, extension: "jpg" };
    }

    if (filename === "nin.png") {
      return { ok: true, path, extension: "png" };
    }

    if (filename === "nin.pdf") {
      return { ok: true, path, extension: "pdf" };
    }

    return { ok: false };
  }

  if (expectedDoc === "birth-certificate") {
    if (filename === "birth-certificate.jpg") {
      return { ok: true, path, extension: "jpg" };
    }

    if (filename === "birth-certificate.png") {
      return { ok: true, path, extension: "png" };
    }

    if (filename === "birth-certificate.pdf") {
      return { ok: true, path, extension: "pdf" };
    }

    return { ok: false };
  }

  return { ok: false };
}

async function readJsonBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; value: unknown } | { ok: false; status: number }> {
  const reader = request.body?.getReader();

  if (!reader) {
    return { ok: false, status: 400 };
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        totalSize += value.byteLength;

        if (totalSize > maxBytes) {
          try {
            await reader.cancel();
          } catch {
            // Ignore cancellation failures.
          }

          return { ok: false, status: 413 };
        }

        chunks.push(value);
      }
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancellation failures.
    }

    return { ok: false, status: 400 };
  }

  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder().decode(buffer);

  if (!text.trim()) {
    return { ok: false, status: 400 };
  }

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400 };
  }
}

export async function POST(request: Request) {
  try {
    // 1. Require JSON.
    const contentType = request.headers.get("content-type") ?? "";

    const mediaTypeMatch = contentType.match(
      /^\s*application\/json(?:\s*;\s*[^;]+=[^;]+)*\s*$/i,
    );

    if (!mediaTypeMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported media type. JSON is required.",
        },
        { status: 415 },
      );
    }

    // 2. Read the request body with a strict size limit.
    const jsonResult = await readJsonBodyWithLimit(
      request,
      MAX_REQUEST_BODY_SIZE,
    );

    if (!jsonResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            jsonResult.status === 413
              ? "Request body exceeds the maximum permitted size of 32 KB."
              : "Invalid JSON request payload.",
        },
        { status: jsonResult.status },
      );
    }

    const body = jsonResult.value;

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Request payload must be a JSON object.",
        },
        { status: 400 },
      );
    }

    // 3. Validate application type.
    if (body.applicationType !== "Online application") {
      return NextResponse.json(
        {
          success: false,
          error: "This endpoint accepts online applications only.",
        },
        { status: 400 },
      );
    }

    // 4. Validate applicant name.
    const applicantName =
      typeof body.applicantName === "string"
        ? body.applicantName.trim()
        : "";

    if (applicantName.length < 1 || applicantName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error: "Applicant full name must be between 1 and 150 characters.",
        },
        { status: 400 },
      );
    }

    // 5. Validate gender.
    const gender =
      typeof body.gender === "string" ? body.gender.trim() : "";

    if (!ALLOWED_GENDERS.has(gender)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select a valid gender.",
        },
        { status: 400 },
      );
    }

    // 6. Validate date of birth using Nigeria's calendar date.
    if (!isValidDateOfBirth(body.dateOfBirth)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide a valid date of birth that is not in the future.",
        },
        { status: 400 },
      );
    }

    const dateOfBirth = body.dateOfBirth;

    // 7. Validate nationality.
    const nationality =
      typeof body.nationality === "string"
        ? body.nationality.trim()
        : "";

    if (nationality.length < 1 || nationality.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Nationality must be between 1 and 100 characters.",
        },
        { status: 400 },
      );
    }

    // 8. Validate state of origin.
    const stateOfOrigin =
      typeof body.stateOfOrigin === "string"
        ? body.stateOfOrigin.trim()
        : "";

    if (stateOfOrigin.length < 1 || stateOfOrigin.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "State of origin must be between 1 and 100 characters.",
        },
        { status: 400 },
      );
    }

    // 9. Validate current address.
    const currentAddress =
      typeof body.currentAddress === "string"
        ? body.currentAddress.trim()
        : "";

    if (currentAddress.length < 1 || currentAddress.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Current address must be between 1 and 1000 characters.",
        },
        { status: 400 },
      );
    }

    // 10. Validate parent or guardian name.
    const parentName =
      typeof body.parentName === "string"
        ? body.parentName.trim()
        : "";

    if (parentName.length < 1 || parentName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error: "Parent or guardian name must be between 1 and 150 characters.",
        },
        { status: 400 },
      );
    }

    // 11. Validate parent or guardian phone number.
    const parentPhone =
      typeof body.parentPhone === "string"
        ? body.parentPhone.trim()
        : "";

    if (
      parentPhone.length < 7 ||
      parentPhone.length > 20 ||
      !/^[+()0-9 -]+$/.test(parentPhone)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid parent or guardian phone number.",
        },
        { status: 400 },
      );
    }

    // 12. Validate academic programme.
    const programme =
      typeof body.programme === "string"
        ? body.programme.trim()
        : "";

    if (!ALLOWED_PROGRAMMES.has(programme)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select a valid academic programme.",
        },
        { status: 400 },
      );
    }

    // 13. Validate previous school (optional).
    let previousSchool: string | null = null;

    if (typeof body.previousSchool === "string") {
      const trimmed = body.previousSchool.trim();

      if (trimmed.length > 200) {
        return NextResponse.json(
          {
            success: false,
            error: "Previous school name cannot exceed 200 characters.",
          },
          { status: 400 },
        );
      }

      if (trimmed.length > 0) {
        previousSchool = trimmed;
      }
    } else if (
      body.previousSchool !== undefined &&
      body.previousSchool !== null
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid previous school format.",
        },
        { status: 400 },
      );
    }

    // 14. Validate reason for leaving (optional).
    let reasonForLeaving: string | null = null;

    if (typeof body.reasonForLeaving === "string") {
      const trimmed = body.reasonForLeaving.trim();

      if (trimmed.length > 2000) {
        return NextResponse.json(
          {
            success: false,
            error: "Reason for leaving cannot exceed 2000 characters.",
          },
          { status: 400 },
        );
      }

      if (trimmed.length > 0) {
        reasonForLeaving = trimmed;
      }
    } else if (
      body.reasonForLeaving !== undefined &&
      body.reasonForLeaving !== null
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reason for leaving format.",
        },
        { status: 400 },
      );
    }

    // 15. Validate applicant review confirmation.
    if (body.consent !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "You must review and confirm the application information.",
        },
        { status: 400 },
      );
    }

    // 16. Validate privacy acknowledgement.
    if (body.privacyAcknowledged !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "You must acknowledge the admissions privacy notice.",
        },
        { status: 400 },
      );
    }

    // 17. Validate privacy notice version.
    if (body.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid privacy notice version.",
        },
        { status: 400 },
      );
    }

    // 18. Validate application identifier.
    if (!isValidUUID(body.applicationId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid application identifier.",
        },
        { status: 400 },
      );
    }

    const applicationId = body.applicationId;

    // 19. Validate document paths and ensure they belong to this application.
    const passportPathValidation = parseAndValidatePath(
      body.passportPhotoPath,
      applicationId,
      "passport",
    );

    if (!passportPathValidation.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid passport photograph document path.",
        },
        { status: 400 },
      );
    }

    const passportPhotoPath = passportPathValidation.path;

    const ninPathValidation = parseAndValidatePath(
      body.ninDocumentPath,
      applicationId,
      "nin",
    );

    if (!ninPathValidation.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid NIN document path.",
        },
        { status: 400 },
      );
    }

    const ninDocumentPath = ninPathValidation.path;

    const birthCertPathValidation = parseAndValidatePath(
      body.birthCertificatePath,
      applicationId,
      "birth-certificate",
    );

    if (!birthCertPathValidation.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid birth certificate document path.",
        },
        { status: 400 },
      );
    }

    const birthCertificatePath = birthCertPathValidation.path;

    // 20. Verify uploaded documents in private Supabase Storage.
    const supabase = createSupabaseServerClient();

    async function verifyStorageDocument(
  label: string,
  path: string,
  expectedExtension: FileExtension,
): Promise<boolean> {
  try {
    const { data: blob, error } = await supabase.storage
      .from(BUCKET)
      .download(path);

    if (error || !blob) {
      console.error(`[Admissions Upload] ${label}: Storage download failed`, {
        errorName: error?.name ?? "Unknown",
        statusCode: error?.statusCode ?? "Unknown",
      });

      return false;
    }

    if (blob.size === 0 || blob.size > MAX_FILE_SIZE) {
      console.error(`[Admissions Upload] ${label}: Invalid file size`, {
        size: blob.size,
      });

      return false;
    }

    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const signature = detectSignature(bytes);

    if (!signature || signature !== expectedExtension) {
      console.error(`[Admissions Upload] ${label}: Signature mismatch`, {
        detected: signature,
        expected: expectedExtension,
        size: blob.size,
      });

      return false;
    }

    console.log(`[Admissions Upload] ${label}: Verified successfully`);

    return true;
  } catch (error) {
    console.error(`[Admissions Upload] ${label}: Verification exception`, {
      errorName: error instanceof Error ? error.name : "Unknown",
    });

    return false;
  }
}

    const [passportValid, ninValid, birthCertValid] = await Promise.all([
  verifyStorageDocument(
    "Passport",
    passportPhotoPath,
    passportPathValidation.extension,
  ),
  verifyStorageDocument(
    "NIN",
    ninDocumentPath,
    ninPathValidation.extension,
  ),
  verifyStorageDocument(
    "Birth certificate",
    birthCertificatePath,
    birthCertPathValidation.extension,
  ),
]);

    if (!passportValid || !ninValid || !birthCertValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or more uploaded documents are missing, invalid, or corrupted.",
        },
        { status: 400 },
      );
    }

    // 21. Generate a server-side application reference.
    // The year uses the school's local calendar year.
    const applicationReference = `IJA-${getSchoolLocalYear()}-${randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    // Store the acknowledgement timestamp as an ISO UTC timestamp.
    const privacyAcknowledgedAt = new Date().toISOString();

    // 22. Insert the application into the database.
    const { error: insertError } = await supabase
      .from("admissions_applications")
      .insert({
        id: applicationId,
        application_reference: applicationReference,
        applicant_name: applicantName,
        gender,
        date_of_birth: dateOfBirth,
        nationality,
        state_of_origin: stateOfOrigin,
        current_address: currentAddress,
        parent_name: parentName,
        parent_phone: parentPhone,
        programme,
        previous_school: previousSchool,
        reason_for_leaving: reasonForLeaving,
        passport_photo_path: passportPhotoPath,
        nin_document_path: ninDocumentPath,
        birth_certificate_path: birthCertificatePath,
        review_confirmed: true,
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
        privacy_acknowledged: true,
        privacy_acknowledged_at: privacyAcknowledgedAt,
      });

    if (insertError) {
      // Do not expose database errors or internal implementation details.
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not submit your application. Please try again later or contact the school office.",
        },
        { status: 500 },
      );
    }

    // 23. Return the application reference to the client.
    return NextResponse.json(
      {
        success: true,
        applicationReference,
      },
      { status: 201 },
    );
  } catch {
    // Keep unexpected errors safe and consistent.
    return NextResponse.json(
      {
        success: false,
        error:
          "We could not submit your application. Please try again later or contact the school office.",
      },
      { status: 500 },
    );
  }
}
