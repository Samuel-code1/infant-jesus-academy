
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserSessionClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserSessionClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] flex items-center justify-center px-5 py-12">
      <section className="w-full max-w-md">
        <div className="text-center mb-9">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#172d25] text-white text-2xl font-serif">
            IJA
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7650]">
            Infant Jesus Academy
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#172d25]">
            Staff Portal
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the school administration system.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-7 shadow-sm sm:p-9"
        >
          <h2 className="text-xl font-semibold text-[#172d25]">
            Welcome back
          </h2>

          <p className="mt-1 mb-7 text-sm text-gray-500">
            Enter your staff account details below.
          </p>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@infantjesusacademy.edu.ng"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#8b7650] focus:ring-2 focus:ring-[#8b7650]/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-20 text-sm outline-none transition focus:border-[#8b7650] focus:ring-2 focus:ring-[#8b7650]/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8b7650]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-lg bg-[#172d25] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#254638] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to portal"}
          </button>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            Authorised school personnel only.
            <br />
            Infant Jesus Academy · Jos, Nigeria
          </p>
        </form>
      </section>
    </main>
  );
}
