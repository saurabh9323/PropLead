"use client";

import { Check, Eye, EyeOff, Loader2, Lock, Mail, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

const demoAccounts = [
  { id: "admin", label: "Admin", email: "admin@proplead.test", password: "Admin@123" },
  { id: "crm", label: "CRM user", email: "crm@proplead.test", password: "Crm@123" },
];

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

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

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

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:mt-5">
        <p className="text-sm font-semibold text-slate-900">Try a demo account</p>
        <p className="mt-1 text-xs text-slate-500">Pick one to fill in the form, then sign in.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {demoAccounts.map((account) => {
            const active = email === account.email && password === account.password;

            return (
              <button
                aria-pressed={active}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
                key={account.id}
                onClick={() => fillDemo(account)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{account.label}</span>
                  <span className="block truncate text-xs text-slate-500">{account.email}</span>
                </span>
                {active ? <Check className="shrink-0 text-emerald-700" size={16} /> : null}
              </button>
            );
          })}
        </div>
      </div>

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