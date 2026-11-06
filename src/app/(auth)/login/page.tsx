"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Connects with backend & Firebase Auth used by the Customer App
      const session = await authService.login({
        email: cleanEmail,
        password: cleanPassword,
      });

      login(session.token, session.user);
      router.push("/");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3 border border-blue-100">
          <Truck className="h-5 w-5 stroke-[1.75]" />
        </div>
        <h1 className="text-base font-medium tracking-tight text-slate-800">
          Central Towing
        </h1>
        <p className="text-xs font-normal text-slate-500 mt-0.5">
          Sign in to dispatch and manage operations
        </p>
      </div>

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs font-normal text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 stroke-[1.75]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-3.5 w-3.5 stroke-[1.75]" />
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-600"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-3.5 w-3.5 stroke-[1.75]" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5 stroke-[1.75]" />
              ) : (
                <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      {/* Light Theme Footer info */}
      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-700">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-medium text-blue-900 text-[11px] uppercase tracking-wide">
            Admin Credentials
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@centraltowing.com");
              setPassword("admin123");
            }}
            className="text-[11px] font-medium text-blue-700 hover:text-blue-800 underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
        <div className="space-y-0.5 text-[11px] text-slate-600 font-mono">
          <div><span className="font-sans text-slate-500">Email:</span> admin@centraltowing.com</div>
          <div><span className="font-sans text-slate-500">Password:</span> admin123</div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-center">
        <p className="text-[11px] font-normal text-slate-400">
          Connected to Towing Central Auth & Fleet Dispatch
        </p>
      </div>
    </div>
  );
}
