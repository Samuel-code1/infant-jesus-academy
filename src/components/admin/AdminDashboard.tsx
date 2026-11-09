
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

type Statistics = {
  total: number;
  pending: number;
  under_review: number;
  accepted: number;
  rejected: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const EMPTY_STATS: Statistics = {
  total: 0,
  pending: 0,
  under_review: 0,
  accepted: 0,
  rejected: 0,
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
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
  color,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e9e8e2] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#19382d]">
            {value.toLocaleString("en-NG")}
          </p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${color}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({
  staffEmail,
  staffRole,
}: {
  staffEmail: string;
  staffRole: string;
}) {
  const [statistics, setStatistics] = useState(EMPTY_STATS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [programme, setProgramme] = useState("");

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadStatistics = useCallback(async () => {
    setLoadingStats(true);

    try {
      const response = await fetch("/api/admin/admissions/summary", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to load statistics.");
      }

      setStatistics(result.statistics);
    } catch (err) {
      console.error("Dashboard statistics:", err);
      setError("Unable to load application statistics.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    setLoadingApplications(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      if (programme) params.set("programme", programme);

      const response = await fetch(
        `/api/admin/admissions?${params.toString()}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to load applications.");
      }

      setApplications(result.applications ?? []);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Dashboard applications:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admissions applications.",
      );
    } finally {
      setLoadingApplications(false);
    }
  }, [pagination.page, pagination.limit, search, status, programme]);

  useEffect(() => {
  let cancelled = false;

  async function fetchStatistics() {
    try {
      const response = await fetch(
        "/api/admin/admissions/summary",
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ?? "Unable to load statistics.",
        );
      }

      if (!cancelled) {
        setStatistics(result.statistics);
      }
    } catch (err) {
      console.error("Dashboard statistics:", err);

      if (!cancelled) {
        setError("Unable to load application statistics.");
      }
    } finally {
      if (!cancelled) {
        setLoadingStats(false);
      }
    }
  }

  void fetchStatistics();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApplications();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadApplications]);

  function updateFilter(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  const navigation = [
    { label: "Overview", icon: "▦", href: "/admin" },
    { label: "Admissions", icon: "▤", href: "/admin/admissions" },
    { label: "Applicants", icon: "♙", href: "/admin/applicants" },
    { label: "Reports", icon: "▥", href: "/admin/reports" },
    { label: "Settings", icon: "⚙", href: "/admin/settings" },
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
              {navigation.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    index === 0
                      ? "bg-white/10 font-semibold text-[#e5cc97]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center text-lg">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 p-5">
            <p className="mb-3 text-xs text-white/50">
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
                <p className="text-xs capitalize text-gray-500">
                  {staffRole.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">
            <section className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Administration</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#19382d] sm:text-3xl">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Here&apos;s an overview of your school&apos;s admissions activity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  void loadStatistics();
                  void loadApplications();
                }}
                disabled={loadingStats || loadingApplications}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                ↻ Refresh data
              </button>
            </section>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-[#19382d]">
                  Admissions statistics
                </h3>
                <span className="text-xs text-gray-400">
                  Live data from Supabase
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="Total applications"
                  value={loadingStats ? 0 : statistics.total}
                  description="All submitted applications"
                  icon="▤"
                  color="bg-[#eaf1ec] text-[#286447]"
                />
                <StatCard
                  label="Pending"
                  value={loadingStats ? 0 : statistics.pending}
                  description="Awaiting review"
                  icon="◷"
                  color="bg-amber-50 text-amber-600"
                />
                <StatCard
                  label="Under review"
                  value={loadingStats ? 0 : statistics.under_review}
                  description="Currently being assessed"
                  icon="⌕"
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  label="Accepted"
                  value={loadingStats ? 0 : statistics.accepted}
                  description="Successful applications"
                  icon="✓"
                  color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  label="Rejected"
                  value={loadingStats ? 0 : statistics.rejected}
                  description="Unsuccessful applications"
                  icon="×"
                  color="bg-red-50 text-red-600"
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#19382d]">
                      Recent applications
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Search and manage submitted admission records.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#286447]">
                    {pagination.total} records
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      updateFilter(setSearch, event.target.value)
                    }
                    placeholder="Search name, reference or phone..."
                    className="min-w-0 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#47745d] focus:ring-2 focus:ring-[#47745d]/10"
                  />

                  <select
                    value={status}
                    onChange={(event) =>
                      updateFilter(setStatus, event.target.value)
                    }
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
                      updateFilter(setProgramme, event.target.value)
                    }
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#47745d]"
                  >
                    {PROGRAMME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-[#f8f9f7] text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Applicant</th>
                      <th className="px-5 py-4 font-semibold">Reference</th>
                      <th className="px-5 py-4 font-semibold">Programme</th>
                      <th className="px-5 py-4 font-semibold">Parent phone</th>
                      <th className="px-5 py-4 font-semibold">Date received</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {loadingApplications ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-gray-500"
                        >
                          Loading applications...
                        </td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center"
                        >
                          <p className="font-semibold text-gray-700">
                            No applications found
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Applications will appear here when they are submitted.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr
                          key={application.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#25372f]">
                              {application.applicant_name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {application.parent_name}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-medium text-[#47745d]">
                            {application.application_reference}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {application.programme}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {application.parent_phone}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(application.created_at)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={application.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                <p className="text-xs text-gray-500">
                  Showing {applications.length} of {pagination.total} applications
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loadingApplications}
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
                    Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages ||
                      loadingApplications
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
