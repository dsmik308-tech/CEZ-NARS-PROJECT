import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user,
    permissions: {
      view: can(user.role, "view"),
      create: can(user.role, "create"),
      edit: can(user.role, "edit"),
      delete: can(user.role, "delete"),
      manageUsers: can(user.role, "manageUsers"),
      manageMaster: can(user.role, "manageMaster"),
      viewAudit: can(user.role, "viewAudit"),
    },
  });
}
