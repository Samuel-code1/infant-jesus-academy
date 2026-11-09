"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "accepted"
  | "rejected";

type ApplicationDocument = {
  available: boolean;
  label: string;
};

type ApplicationDocumentSummary = Record<
  "passport_photo" | "nin_document" | "birth_certificate",
  ApplicationDocument
>;

type Application = {
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

type ApplicationResponse = {
  success: true;
  application: Application;
  documents: ApplicationDocumentSummary;
};

type ErrorResponse = {
  success: false;
  error?: string;
};

function AcademyLogoMark() {
  return (
    <svg
      viewBox="0 0 64 72"
      width="40"
      height="44"
      role="img"
      aria-label="Infant Jesus Academy crest"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M32 3 57 12V33C57 49 46 61 32 68 18 61 7 49 7 33V12Z"
        fill="#172c43"
        stroke="#b18d52"
        strokeWidth="2"
      />
      <path
        d="M32 8 52 15V33C52 46 43 56 32 62 21 56 12 46 12 33V15Z"
        fill="none"
        stroke="#e2c995"
        strokeWidth="0.8"
      />
      <path
        d="M18 25Q25 22 32 28Q39 22 46 25V39Q39 36 32 42Q25 36 18 39Z"
        fill="#fffefa"
        stroke="#e2c995"
        strokeWidth="1"
      />
      <path d="M32 28V42" fill="none" stroke="#b18d52" strokeWidth="1.4" />
      <text
        x="32"
        y="52"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#e2c995"
      >
        IJA
      </text>
    </svg>
  );
}

function isErrorResponse(
  result: ErrorResponse | ApplicationResponse
): result is ErrorResponse {
  return result.success === false;
}

function getErrorMessage(
  result: ErrorResponse | ApplicationResponse,
  fallback: string
) {
  if (isErrorResponse(result)) {
    return result.error ?? fallback;
  }

  return fallback;
}

const STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function formatDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(status: ApplicationStatus) {
  return status.replaceAll("_", " ");
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    under_review: "bg-blue-50 text-blue-700",
    accepted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function displayText(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "Not provided";
}

export default function ApplicationDetailsView({
  applicationId,
}: {
  applicationId: string;
}) {
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocumentSummary | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/admissions/${applicationId}`, {
        cache: "no-store",
      });

      const result = (await response.json()) as
        | { success: false; error?: string }
        | ApplicationResponse;

      if (!response.ok) {
        throw new Error(
          isErrorResponse(result) && typeof result.error === "string"
            ? result.error
            : "Unable to load application details."
        );
      }

      if (!result.success) {
        throw new Error(
          isErrorResponse(result) ? result.error ?? "Unable to load application details." : "Unable to load application details."
        );
      }

      setApplication(result.application);
      setDocuments(result.documents);
      setStatus(result.application.status);
    } catch (err) {
      console.error("Application details load failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load application details."
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const documentLinks = useMemo(() => {
    if (!documents) {
      return [] as Array<{ key: string; label: string; href: string }>;
    }

    return (
      Object.entries(documents)
        .filter(([, details]) => details.available)
        .map(([key, details]) => ({
          key,
          label: details.label,
          href: `/api/admin/admissions/${applicationId}/documents/${key}`,
        }))
    );
  }, [applicationId, documents]);

  async function updateStatus() {
    if (!application || status === application.status || saving) {
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/admissions/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ status }),
      });

      const result = (await response.json()) as
        | { success: false; error?: string }
        | ApplicationResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Unable to update the application status.")
        );
      }

      if (!result.success) {
        throw new Error(
          getErrorMessage(result, "Unable to update the application status.")
        );
      }

      setApplication(result.application);
      setDocuments(result.documents);
      setStatus(result.application.status);
      setNotice({
        type: "success",
        message: "Application status updated successfully.",
      });
    } catch (err) {
      console.error("Application status update failed:", err);
      setNotice({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Unable to update the application status.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-[#25372f]">
      <header className="border-b border-[#e9e4da] bg-[#fffdf9]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3 rounded-xl border border-[#e9e4da] bg-white px-2.5 py-2 shadow-sm transition hover:border-[#c49a52] hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#142b46] p-1.5">
                <AcademyLogoMark />
              </span>
              <span className="leading-tight">
                <span className="block text-[10px] font-bold tracking-[0.18em] text-[#142b46]">
                  INFANT JESUS
                </span>
                <span className="block text-[9px] font-semibold tracking-[0.28em] text-[#a57c3e]">
                  ACADEMY
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#243346]">
            <Link href="/admin" className="rounded-full border border-transparent px-3 py-2 font-medium text-[#1e2d3d] transition hover:border-[#e9e4da] hover:bg-white">
              Overview
            </Link>
            <Link href="/admin/admissions" className="rounded-full border border-transparent px-3 py-2 font-medium text-[#1e2d3d] transition hover:border-[#e9e4da] hover:bg-white">
              Admissions
            </Link>
            <Link href="/" className="rounded-full border border-transparent px-3 py-2 font-medium text-[#1e2d3d] transition hover:border-[#e9e4da] hover:bg-white">
              School site
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/admissions"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-gray-50"
            >
              ← Back to admissions
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Admissions administration</p>
            <h1 className="mt-1 text-2xl font-bold text-[#19382d] sm:text-3xl">
              Application details
            </h1>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadApplication()}
              className="ml-3 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            Loading application details...
          </div>
        ) : !application ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            No application was found for this record.
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#47745d]">
                    Application reference
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[#19382d]">
                    {application.application_reference}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={application.status} />
                  <span className="text-sm text-gray-500">
                    Submitted {formatDate(application.created_at)}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                <div>
                  <p className="text-sm text-gray-500">Applicant</p>
                  <p className="mt-1 text-xl font-semibold text-[#25372f]">
                    {displayText(application.applicant_name)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-[#f8faf8] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Current status
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#47745d] focus:outline-none"
                      aria-label="Update application status"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => void updateStatus()}
                      disabled={saving || status === application.status}
                      className="rounded-xl bg-[#173b2f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#143127] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>

              {notice && (
                <div
                  role="status"
                  className={`mt-5 rounded-xl border p-3 text-sm ${
                    notice.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {notice.message}
                </div>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold text-[#19382d]">Applicant information</h3>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Gender
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {displayText(application.gender)}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Date of birth
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {formatDate(application.date_of_birth)}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Nationality
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {displayText(application.nationality)}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      State of origin
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {displayText(application.state_of_origin)}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4 sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Address
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {displayText(application.current_address)}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold text-[#19382d]">Parent / guardian</h3>

                <dl className="mt-5 space-y-4">
                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Name
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {displayText(application.parent_name)}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Phone number
                    </dt>
                    <dd className="mt-2 text-sm text-[#25372f]">
                      {displayText(application.parent_phone)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-[#19382d]">Academic information</h3>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                    Programme
                  </dt>
                  <dd className="mt-2 text-sm text-[#25372f]">
                    {displayText(application.programme)}
                  </dd>
                </div>

                <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                    Previous school
                  </dt>
                  <dd className="mt-2 text-sm text-[#25372f]">
                    {displayText(application.previous_school)}
                  </dd>
                </div>

                <div className="rounded-xl border border-gray-100 bg-[#fafcfb] p-4 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                    Reason for leaving
                  </dt>
                  <dd className="mt-2 text-sm text-[#25372f]">
                    {displayText(application.reason_for_leaving)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-[#19382d]">Supporting documents</h3>

              {documentLinks.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">
                  No uploaded documents are available for this application.
                </p>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  {documentLinks.map((document) => (
                    <a
                      key={document.key}
                      href={document.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[#dce7df] bg-[#edf3ee] px-4 py-2.5 text-sm font-semibold text-[#286447] transition hover:bg-[#e0ece4]"
                    >
                      View {document.label}
                    </a>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-[#e9e4da] bg-[#fffdf9] px-4 py-5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#677482] sm:px-6 lg:px-8">
        Infant Jesus Academy Administration · Secure staff workspace
      </footer>
    </div>
  );
}
