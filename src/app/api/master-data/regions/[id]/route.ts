import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const existing = await prisma.region.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: "Region not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, string> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.code === "string" && body.code.trim()) data.code = body.code.trim();

  const updated = await prisma.region.update({ where: { id: params.id }, data });
  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "REGION_UPDATE",
    entity: "Region",
    entityId: updated.id,
    details: updated.name,
    ipAddress: clientIp(req),
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const existing = await prisma.region.findUnique({
    where: { id: params.id },
    include: { _count: { select: { properties: true, provinces: true } } },
  });
  if (!existing) return NextResponse.json({ message: "Region not found." }, { status: 404 });
  if (existing._count.properties > 0) {
    return NextResponse.json(
      { message: "Cannot delete a region that still has property records." },
      { status: 409 }
    );
  }

  await prisma.region.delete({ where: { id: params.id } });
  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "REGION_DELETE",
    entity: "Region",
    entityId: params.id,
    details: existing.name,
    ipAddress: clientIp(req),
  });
  return NextResponse.json({ ok: true });
}
