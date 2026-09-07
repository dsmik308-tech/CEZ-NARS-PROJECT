import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const existing = await prisma.province.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: "Province not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, string> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.code === "string" && body.code.trim()) data.code = body.code.trim();
  if (typeof body.regionId === "string" && body.regionId.trim()) data.regionId = body.regionId.trim();

  const updated = await prisma.province.update({ where: { id: params.id }, data });
  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "PROVINCE_UPDATE",
    entity: "Province",
    entityId: updated.id,
    details: updated.name,
    ipAddress: clientIp(req),
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const existing = await prisma.province.findUnique({
    where: { id: params.id },
    include: { _count: { select: { properties: true } } },
  });
  if (!existing) return NextResponse.json({ message: "Province not found." }, { status: 404 });
  if (existing._count.properties > 0) {
    return NextResponse.json(
      { message: "Cannot delete a province that still has property records." },
      { status: 409 }
    );
  }

  await prisma.province.delete({ where: { id: params.id } });
  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "PROVINCE_DELETE",
    entity: "Province",
    entityId: params.id,
    details: existing.name,
    ipAddress: clientIp(req),
  });
  return NextResponse.json({ ok: true });
}
