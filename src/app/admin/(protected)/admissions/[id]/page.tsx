import { redirect } from "next/navigation";

import ApplicationDetailsView from "@/components/admin/ApplicationDetailsView";
import { getAuthenticatedStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

export default async function AdmissionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    redirect("/admin/login");
  }

  if (staff.role !== "administrator") {
    redirect("/admin");
  }

  const { id } = await params;

  return <ApplicationDetailsView applicationId={id} />;
}
