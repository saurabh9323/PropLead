"use client";

import { Eye, EyeOff, Loader2, Lock, Mail, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";


const fieldClass =
  "group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100";

const iconClass = "shrink-0 text-slate-400 transition-colors group-focus-within:text-emerald-700";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}

export default function LoginForm({ action, initialError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [showHelp, setShowHelp] = useState(false);



  return (
    <>
      {error ? (
        <div
          className="mt-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          role="alert"
        >
          <TriangleAlert className="mt-0.5 shrink-0" size={16} />
          <p className="min-w-0 flex-1">{error}</p>
          <button
            aria-label="Dismiss error"
            className="rounded p-0.5 text-rose-600 hover:bg-rose-100"
            onClick={() => setError("")}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <form action={action} className="mt-8 space-y-5 lg:mt-5 lg:space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-900">Email</span>
          <span className={`${fieldClass} mt-2`}>
            <Mail className={iconClass} size={18} />
            <input
              autoComplete="email"
              className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
              name="email"
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
          </span>
        </label>

        <div>
          <label className="block" htmlFor="login-password">
            <span className="text-sm font-medium text-slate-900">Password</span>
          </label>
          <div className={`${fieldClass} mt-2`}>
            <Lock className={iconClass} size={18} />
            <input
              autoComplete="current-password"
              className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
              id="login-password"
              name="password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
              onBlur={() => setCapsLock(false)}
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {capsLock ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700" role="status">
              <TriangleAlert size={14} />
              Caps Lock is on
            </p>
          ) : null}
        </div>

        <SubmitButton />
      </form>

      <div className="mt-6 text-center text-sm text-slate-500 lg:mt-4">
        <button
          aria-expanded={showHelp}
          className="font-semibold text-slate-900 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          onClick={() => setShowHelp((value) => !value)}
          type="button"
        >
          Trouble signing in?
        </button>
        {showHelp ? (
          <p className="mx-auto mt-2 max-w-xs">
            Ask your workspace admin to reset your password or check that your account is active.
          </p>
        ) : null}
      </div>
    </>
  );
}