import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, hashPassword, requireUser, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || "");
  const nextPassword = String(body.nextPassword || "");

  if (nextPassword.length < 10) {
    return NextResponse.json(
      { message: "New password must be at least 10 characters." },
      { status: 400 }
    );
  }

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const ok = await verifyPassword(currentPassword, record.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(nextPassword) },
  });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "PASSWORD_CHANGE",
    entity: "User",
    entityId: user.id,
    ipAddress: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
