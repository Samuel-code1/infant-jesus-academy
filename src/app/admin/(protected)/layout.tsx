
import { redirect } from "next/navigation";
import { getAuthenticatedStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
