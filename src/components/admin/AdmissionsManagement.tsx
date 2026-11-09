
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

type ApplicationStatus =
  | "pending"
  | "under_review"
  | "accepted"
  | "rejected";

type Application = {
  id: string;
  application_reference: string;
  applicant_name: string;
  gender: string | null;
  date_of_birth: string | null;
  parent_name: string;
  parent_phone: string;
  programme: string;
  status: ApplicationStatus;
  created_at: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const PROGRAMME_OPTIONS = [
  { value: "", label: "All programmes" },
  { value: "Nursery Education", label: "Nursery Education" },
  { value: "Primary Education", label: "Primary Education" },
  { value: "Secondary Education", label: "Secondary Education" },
];

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

export default function AdmissionsManagement({
  staffEmail,
}: {
  staffEmail: string;
}) {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [programme, setProgramme] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (programme) {
        params.set("programme", programme);
      }

      const response = await fetch(
        `/api/admin/admissions?${params.toString()}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ?? "Unable to retrieve applications.",
        );
      }

      setApplications(result.applications ?? []);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Admissions management:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admissions applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    status,
    programme,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApplications();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadApplications]);

  function changeFilter(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setProgramme("");
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }

  const navigation = [
    { label: "Overview", href: "/admin", icon: "▦" },
    { label: "Admissions", href: "/admin/admissions", icon: "▤" },
    { label: "Applicants", href: "/admin/applicants", icon: "♙" },
    { label: "Reports", href: "/admin/reports", icon: "▥" },
    { label: "Settings", href: "/admin/settings", icon: "⚙" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-[#25372f]">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#173b2f] text-white transition-transform lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-white/10 px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d7bd83] text-xl font-bold text-[#173b2f]">
                I
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide">
                  INFANT JESUS
                </p>
                <p className="text-xs tracking-[0.2em] text-[#d7bd83]">
                  ACADEMY
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pt-7">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Main menu
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = item.href === "/admin/admissions";

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active
                        ? "bg-white/10 font-semibold text-[#e5cc97]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="w-5 text-center text-lg">
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 p-5">
            <p className="mb-2 text-xs text-white/50">
              Signed in as administrator
            </p>

            <p className="mb-4 truncate text-sm font-medium">
              {staffEmail}
            </p>

            <LogoutButton />
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#e9e4da] bg-[#fffdf9]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d9d6cd] bg-white px-3 py-2 text-sm font-semibold text-[#173b2f] shadow-sm lg:hidden"
                  aria-label="Open navigation"
                >
                  <span aria-hidden="true">☰</span>
                  Menu
                </button>
              </div>

              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#243346] lg:justify-end">
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

              <div className="hidden text-right lg:block">
                <p className="text-sm font-semibold text-[#173b2f]">{staffEmail}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">
            <section className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Student administration
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#19382d] sm:text-3xl">
                  Applications
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review, search and manage submitted admission applications.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-gray-50"
              >
                Back to overview
              </button>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#19382d]">
                    All applications
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Applications submitted through the school website.
                  </p>
                </div>

                <span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#286447]">
                  {pagination.total.toLocaleString("en-NG")} records
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_220px_auto]">
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    changeFilter(setSearch, event.target.value)
                  }
                  placeholder="Search applicant, reference or phone..."
                  aria-label="Search applications"
                  className="min-w-0 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#47745d] focus:ring-2 focus:ring-[#47745d]/10"
                />

                <select
                  value={status}
                  onChange={(event) =>
                    changeFilter(setStatus, event.target.value)
                  }
                  aria-label="Filter by application status"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#47745d]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={programme}
                  onChange={(event) =>
                    changeFilter(setProgramme, event.target.value)
                  }
                  aria-label="Filter by academic programme"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#47745d]"
                >
                  {PROGRAMME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Clear filters
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-[#f8f9f7] text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Applicant
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Application reference
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Programme
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Parent / guardian
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date received
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-14 text-center text-gray-500"
                        >
                          Loading applications...
                        </td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-14 text-center">
                          <div className="mx-auto max-w-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3ee] text-xl text-[#47745d]">
                              ▤
                            </div>

                            <p className="mt-4 font-semibold text-gray-700">
                              No applications found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Try changing your filters or search for another applicant.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr
                          key={application.id}
                          className="transition hover:bg-[#fafbf9]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#25372f]">
                              {application.applicant_name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {application.gender ?? "Gender not provided"}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-medium text-[#47745d]">
                            {application.application_reference}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {application.programme}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-700">
                              {application.parent_name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {application.parent_phone}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(application.created_at)}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={application.status} />
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/admissions/${application.id}`,
                                )
                              }
                              className="whitespace-nowrap rounded-lg border border-[#dce7df] px-3 py-2 text-xs font-semibold text-[#286447] transition hover:bg-[#edf3ee]"
                            >
                              View application →
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-500">
                  Showing {applications.length} of {pagination.total} applications
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page - 1,
                      }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-xs text-gray-500">
                    Page {pagination.page} of{" "}
                    {Math.max(pagination.totalPages, 1)}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page + 1,
                      }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>

            <footer className="mt-8 border-t border-[#e9e4da] pt-5 pb-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#677482]">
              Infant Jesus Academy Administration · Secure staff workspace
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
