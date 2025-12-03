"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, MessageCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to sign in. Please check your credentials.";
        setError(message);
        setIsSubmitting(false);
        return;
      }

      router.replace("/");
    } catch (error_) {
      setError(
        error_ instanceof Error
          ? error_.message
          : "Unexpected error during sign in.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Internal Tool
            </p>
            <h1 className="text-lg font-semibold text-slate-50">
              Chat Dashboard Login
            </h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium uppercase tracking-wide text-slate-300"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus-visible:ring-emerald-500"
              placeholder="Enter your dashboard username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wide text-slate-300"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus-visible:ring-emerald-500"
              placeholder="Enter your dashboard password"
              required
            />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-xs text-rose-100">
              <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-rose-300" />
              <p>{error}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in to dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}

