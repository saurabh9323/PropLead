import LeadsComp from "@/components/Leads/LeadsComp";

export default async function LeadsPage({ searchParams }) {
  const params = await searchParams;

  return <LeadsComp searchParams={params} />;
}
