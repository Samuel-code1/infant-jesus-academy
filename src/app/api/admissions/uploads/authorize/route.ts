import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_BODY_SIZE = 16 * 1024;
const MAX_FILENAME_LENGTH = 255;
const BUCKET = "admissions-private";

const REQUIRED_FILES = [
  "passportPhoto",
  "ninDocument",
  "birthCertificate",
] as const;

const DOCUMENT_METADATA_KEYS = ["name", "type", "size"] as const;

type FileKey = (typeof REQUIRED_FILES)[number];

type DocumentMetadata = {
  name: string;
  type: string;
  size: number;
};

type UploadAuthorization = {
  path: string;
  token: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
          reader.cancel();
          return { ok: false, status: 413 };
        }

        chunks.push(value);
      }
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancellation failures; do not expose stream internals.
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

function validateMetadataObject(
  fileKey: FileKey,
  value: unknown,
): DocumentMetadata | null {
  if (!isRecord(value)) {
    return null;
  }

  const keys = Object.keys(value).sort();
  const allowedKeys = [...DOCUMENT_METADATA_KEYS].sort();

  if (keys.length !== allowedKeys.length || !allowedKeys.every((key) => keys.includes(key))) {
    return null;
  }

  const name = value.name;
  const type = value.type;
  const size = value.size;

  if (typeof name !== "string") {
    return null;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0 || trimmedName.length > MAX_FILENAME_LENGTH) {
    return null;
  }

  if (typeof type !== "string") {
    return null;
  }

  const normalizedType = type.trim().toLowerCase();
  const allowedMimeTypes =
    fileKey === "passportPhoto"
      ? new Set(["image/jpeg", "image/png"])
      : new Set(["image/jpeg", "image/png", "application/pdf"]);

  if (!allowedMimeTypes.has(normalizedType)) {
    return null;
  }

  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) {
    return null;
  }

  return {
    name: trimmedName,
    type: normalizedType,
    size,
  };
}

function getValidatedExtension(fileKey: FileKey, mimeType: string): string | null {
  const normalizedType = mimeType.trim().toLowerCase();

  if (fileKey === "passportPhoto") {
    if (normalizedType === "image/jpeg") {
      return "jpg";
    }

    if (normalizedType === "image/png") {
      return "png";
    }

    return null;
  }

  if (normalizedType === "image/jpeg") {
    return "jpg";
  }

  if (normalizedType === "image/png") {
    return "png";
  }

  if (normalizedType === "application/pdf") {
    return "pdf";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const mediaTypeMatch = contentType.match(/^\s*application\/json(?:\s*;\s*[^;]+=[^;]+)*\s*$/i);

    if (!mediaTypeMatch) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 415 },
      );
    }

    const jsonResult = await readJsonBodyWithLimit(request, MAX_REQUEST_BODY_SIZE);

    if (!jsonResult.ok) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: jsonResult.status === 413 ? 413 : 400 },
      );
    }

    const body = jsonResult.value;

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    }

    const bodyKeys = Object.keys(body).sort();
    const expectedKeys = [...REQUIRED_FILES].sort();

    if (
      bodyKeys.length !== expectedKeys.length ||
      !expectedKeys.every((key) => bodyKeys.includes(key))
    ) {
      return NextResponse.json(
        { error: "Exactly three document metadata entries are required." },
        { status: 400 },
      );
    }

    const metadataEntries: Partial<Record<FileKey, DocumentMetadata>> = {};

    for (const key of REQUIRED_FILES) {
      const metadata = validateMetadataObject(key, body[key]);

      if (!metadata) {
        return NextResponse.json(
          { error: `Invalid metadata for ${key}.` },
          { status: 400 },
        );
      }

      metadataEntries[key] = metadata;
    }

    const supabase = createSupabaseServerClient();
    const applicationId = randomUUID();
    const uploads: Partial<Record<FileKey, UploadAuthorization>> = {};

    for (const key of REQUIRED_FILES) {
      const metadata = metadataEntries[key];

      if (!metadata) {
        return NextResponse.json(
          { error: `Invalid metadata for ${key}.` },
          { status: 400 },
        );
      }

      const extension = getValidatedExtension(key, metadata.type);

      if (!extension) {
        return NextResponse.json(
          { error: `Unsupported file type for ${key}.` },
          { status: 400 },
        );
      }

      const fileName =
        key === "birthCertificate"
          ? `birth-certificate.${extension}`
          : key === "ninDocument"
            ? `nin.${extension}`
            : `passport.${extension}`;

      const path = `${applicationId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(path, { upsert: false });

      if (error || !data) {
        return NextResponse.json(
          { error: "We could not prepare secure document uploads." },
          { status: 500 },
        );
      }

      uploads[key] = {
        path,
        token: data.token,
      };
    }

    return NextResponse.json(
      {
        success: true,
        applicationId,
        uploads: {
          passportPhoto: uploads.passportPhoto,
          ninDocument: uploads.ninDocument,
          birthCertificate: uploads.birthCertificate,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "We could not prepare secure document uploads." },
      { status: 500 },
    );
  }
}
