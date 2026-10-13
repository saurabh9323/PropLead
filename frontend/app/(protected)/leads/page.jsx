import LeadsComp from "@/components/Leads/LeadsComp";
import { requireUser } from "@/lib/auth";

export default async function LeadsPage() {
  const user = await requireUser();
  return <LeadsComp canDelete={user.role === "admin"} />;
}
