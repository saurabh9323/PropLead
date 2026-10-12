import UserMasterComp from "@/components/UserMaster/UserMasterComp.jsx";

export default async function UsersPage({ searchParams }) {
  const params = await searchParams;

  return <UserMasterComp searchParams={params} />;
}
