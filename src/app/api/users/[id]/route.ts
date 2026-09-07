import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, hashPassword, requirePermission } from "@/lib/auth";
import { isRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user: actor, error } = await requirePermission("manageUsers");
  if (error || !actor) return error!;

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.fullName === "string" && body.fullName.trim()) data.fullName = body.fullName.trim();
  if (typeof body.email === "string" && body.email.trim()) data.email = body.email.trim().toLowerCase();
  if (typeof body.office === "string") data.office = body.office.trim() || null;
  if (typeof body.role === "string" && isRole(body.role.toUpperCase())) data.role = body.role.toUpperCase();
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.unlock === true) {
    data.failedAttempts = 0;
    data.lockedUntil = null;
  }
  if (typeof body.password === "string" && body.password.length >= 10) {
    data.passwordHash = await hashPassword(body.password);
  }

  if (params.id === actor.id && data.active === false) {
    return NextResponse.json({ message: "You cannot deactivate your own account." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      office: true,
      active: true,
      lastLoginAt: true,
      failedAttempts: true,
      lockedUntil: true,
    },
  });

  await writeAudit({
    userId: actor.id,
    username: actor.username,
    action: body.password ? "USER_RESET_PASSWORD" : body.unlock ? "USER_UNLOCK" : "USER_UPDATE",
    entity: "User",
    entityId: updated.id,
    details: JSON.stringify({ username: updated.username, role: updated.role, active: updated.active }),
    ipAddress: clientIp(req),
  });

  return NextResponse.json(updated);
}
