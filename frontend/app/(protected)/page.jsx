import DashboardComp from "@/components/Dashboard/DashboardComp";

export default async function DashboardPage({ searchParams }) {
  return <DashboardComp searchParams={await searchParams} />;
}
