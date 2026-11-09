
import { redirect } from "next/navigation";

import { getAuthenticatedStaff } from "@/lib/auth/staff";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    redirect("/admin/login");
  }

  return (
    <AdminDashboard
      staffEmail={staff.email ?? "School administrator"}
      staffRole={staff.role}
    />
  );
}
