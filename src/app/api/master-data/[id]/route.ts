import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const existing = await prisma.masterOption.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: "Master record not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.label === "string" && body.label.trim()) data.label = body.label.trim();
  if (typeof body.code === "string") data.code = body.code.trim() || null;
  if (typeof body.category === "string" && body.category.trim()) data.category = body.category.trim();
  if (typeof body.sortOrder === "number" || typeof body.sortOrder === "string") {
    data.sortOrder = Number(body.sortOrder) || 0;
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.metadata && typeof body.metadata === "object") data.metadata = JSON.stringify(body.metadata);
  if (typeof body.metadata === "string") data.metadata = body.metadata;

  const updated = await prisma.masterOption.update({
    where: { id: params.id },
    data,
  });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "MASTER_UPDATE",
    entity: "MasterOption",
    entityId: updated.id,
    details: `${updated.category}: ${updated.label}`,
    ipAddress: clientIp(req),
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const existing = await prisma.masterOption.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: "Master record not found." }, { status: 404 });
  }

  await prisma.masterOption.delete({ where: { id: params.id } });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "MASTER_DELETE",
    entity: "MasterOption",
    entityId: params.id,
    details: `${existing.category}: ${existing.label}`,
    ipAddress: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
