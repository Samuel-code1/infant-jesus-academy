
import { redirect } from "next/navigation";

import { getAuthenticatedStaff } from "@/lib/auth/staff";
import AdmissionsManagement from "@/components/admin/AdmissionsManagement";

export const dynamic = "force-dynamic";

export default async function AdmissionsPage() {
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    redirect("/admin/login");
  }

  if (staff.role !== "administrator") {
    redirect("/admin");
  }

  return (
    <AdmissionsManagement
      staffEmail={staff.email ?? "School administrator"}
    />
  );
}
