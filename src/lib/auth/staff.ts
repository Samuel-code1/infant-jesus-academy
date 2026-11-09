
import "server-only";

import { createSupabaseSessionClient } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole =
  | "administrator"
  | "admissions_officer";

export type AuthenticatedStaff = {
  userId: string;
  email: string | null;
  role: StaffRole;
};

function isStaffRole(value: unknown): value is StaffRole {
  return (
    value === "administrator" ||
    value === "admissions_officer"
  );
}

export async function getAuthenticatedStaff(): Promise<AuthenticatedStaff | null> {
  // 1. Verify the user's Supabase session.
  const sessionClient = await createSupabaseSessionClient();

  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // 2. Check the staff profile using the server-only client.
  const adminClient = createSupabaseServerClient();

  const {
    data: profile,
    error: profileError,
  } = await adminClient
    .from("staff_profiles")
    .select("user_id, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    return null;
  }

  // 3. Reject unrecognised roles.
  if (!isStaffRole(profile.role)) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile.role,
  };
}

export async function requireAuthenticatedStaff(): Promise<AuthenticatedStaff> {
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    throw new Error("UNAUTHORIZED");
  }

  return staff;
}

export async function requireStaffRole(
  allowedRoles: StaffRole[]
): Promise<AuthenticatedStaff> {
  // 1. Confirm the user is authenticated staff.
  const staff = await requireAuthenticatedStaff();

  // 2. Confirm the staff member has an allowed role.
  if (!allowedRoles.includes(staff.role)) {
    throw new Error("FORBIDDEN");
  }

  return staff;
}
