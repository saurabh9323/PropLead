import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, Eye, Lock, Mail, Sparkles } from "lucide-react";
import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen bg-white text-slate-950 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#12352f] px-12 py-14 text-white lg:block">
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-emerald-300/20" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="inline-flex w-fit items-center gap-3 rounded-md bg-white px-7 py-3 text-[#12352f] shadow-sm">
            <span className="text-4xl font-black tracking-normal">PROP</span>
            <span className="text-xs font-bold uppercase leading-3 text-emerald-600">Lead CRM</span>
          </div>

          <div className="mt-24 max-w-xl">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-100">
              <Sparkles size={17} />
              Real estate pipeline made simple.
            </p>
            <h1 className="mt-7 text-6xl font-black leading-tight tracking-normal">
              Real estate leads, clearly organized.
            </h1>
            <p className="mt-8 text-lg leading-8 text-white/80">
              A calm workspace for tracking enquiries, assigning CRM users, monitoring site visits, and understanding conversion progress.
            </p>

            <div className="mt-12 grid max-w-xl grid-cols-2 gap-4">
              {["Enquiries", "Site Visits", "Follow-ups", "Closures"].map((item) => (
                <div
                  className="rounded-md border border-white/15 bg-white/10 px-5 py-4 text-sm font-semibold text-white"
                  key={item}
                >
                  <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-auto text-sm text-white/60">2026 PropLead CRM. All rights reserved.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <p className="text-xs font-bold uppercase text-emerald-600">PropLead CRM</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Welcome back</h1>
          </div>

          <h2 className="text-4xl font-black tracking-normal text-slate-950">Sign in</h2>
          <p className="mt-3 text-base text-slate-500">
            Welcome back, pick up right where you left off.
          </p>

          {params?.error ? (
            <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {params.error}
            </div>
          ) : null}

          <form action={loginAction} className="mt-10 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-3 focus-within:border-emerald-500">
                <Mail className="text-slate-500" size={20} />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  defaultValue="admin@proplead.test"
                  name="email"
                  type="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-3 focus-within:border-emerald-500">
                <Lock className="text-slate-500" size={20} />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  defaultValue="Admin@123"
                  name="password"
                  type="password"
                />
                <Eye className="text-slate-500" size={20} />
              </div>
            </label>

            <button
              className="flex w-full items-center justify-center gap-3 rounded-md bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
              type="submit"
            >
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            <span>Trouble signing in? </span>
            <span className="font-bold text-slate-950 underline">Contact admin</span>
          </div>

          <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-950">Demo credentials</p>
            <p className="mt-2">Admin: admin@proplead.test / Admin@123</p>
            <p>CRM: crm@proplead.test / Crm@123</p>
          </div>
        </div>
      </section>
    </main>
  );
}

