import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export default async function ProtectedLayout({ children }) {
  const user = await requireUser();

  return (
    <AppShell logoutAction={logoutAction} user={user}>
      {children}
    </AppShell>
  );
}
