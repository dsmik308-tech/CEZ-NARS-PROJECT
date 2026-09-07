import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, hashPassword, requirePermission } from "@/lib/auth";
import { isRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requirePermission("manageUsers");
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { user: actor, error } = await requirePermission("manageUsers");
  if (error || !actor) return error!;

  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.fullName || "").trim();
  const role = String(body.role || "").trim().toUpperCase();
  const office = String(body.office || "").trim() || null;
  const password = String(body.password || "");

  if (!username || !email || !fullName || !isRole(role)) {
    return NextResponse.json({ message: "Complete all required user fields." }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ message: "Password must be at least 10 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return NextResponse.json({ message: "Username or email already exists." }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      role,
      office,
      passwordHash: await hashPassword(password),
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      office: true,
      active: true,
      createdAt: true,
    },
  });

  await writeAudit({
    userId: actor.id,
    username: actor.username,
    action: "USER_CREATE",
    entity: "User",
    entityId: created.id,
    details: `Created ${created.username} as ${created.role}`,
    ipAddress: clientIp(req),
  });

  return NextResponse.json(created, { status: 201 });
}
