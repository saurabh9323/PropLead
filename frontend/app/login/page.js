import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import LoginForm from "./LoginForm";
import LoginShowcase from "./LoginShowcase";

function BrandMark({ onDark = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-11 w-11 place-items-center rounded-lg text-xl font-black ${
          onDark ? "bg-white text-[#12352f]" : "bg-[#12352f] text-white"
        }`}
      >
        P
      </span>
      <div className="leading-tight">
        <p className={`text-lg font-bold ${onDark ? "text-white" : "text-slate-950"}`}>PropLead CRM</p>
        <p className={`text-sm ${onDark ? "text-emerald-100/80" : "text-slate-500"}`}>
          Lead desk for property teams
        </p>
      </div>
    </div>
  );
}

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    redirect("/");
  }

  const initialError = typeof params?.error === "string" ? params.error : "";

  return (
    <main className="grid min-h-dvh bg-white text-slate-950 lg:h-dvh lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
      <section className="relative hidden overflow-hidden bg-[#12352f] px-10 py-8 text-white lg:flex lg:flex-col xl:px-14 xl:py-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-emerald-300/15" />

        <div className="relative z-10 flex flex-1 flex-col">
          <BrandMark onDark />

          <div className="mt-8 xl:mt-10">
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight xl:text-[2.6rem]">
              Real estate leads, clearly organized.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-6 text-white/75">
              Track enquiries, assign CRM users, monitor site visits and watch conversion progress in one calm workspace.
            </p>

            <LoginShowcase />
          </div>

          <p className="mt-auto pt-4 text-sm text-white/50 [@media(max-height:760px)]:hidden">© 2026 PropLead CRM. All rights reserved.</p>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0 lg:overflow-hidden lg:py-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Sign in</h2>
          <p className="mt-2 text-base text-slate-500">Pick up right where you left off.</p>

          <LoginForm action={loginAction} initialError={initialError} />
        </div>
      </section>
    </main>
  );
}