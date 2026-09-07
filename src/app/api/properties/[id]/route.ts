import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission, requireUser } from "@/lib/auth";
import { propertyPatchSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error } = await requireUser();
  if (error) return error;
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { region: true, province: true },
  });

  if (!property) {
    return NextResponse.json({ message: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("edit");
  if (error || !user) return error!;

  const body = await req.json();
  const parsed = propertyPatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.property.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: "Property not found" }, { status: 404 });
  }

  const property = await prisma.property.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "PROPERTY_UPDATE",
    entity: "Property",
    entityId: property.id,
    details: property.assetName,
    ipAddress: clientIp(req),
  });

  return NextResponse.json(property);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requirePermission("delete");
  if (error || !user) return error!;

  const existing = await prisma.property.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: "Property not found" }, { status: 404 });
  }

  await prisma.property.delete({
    where: { id: params.id },
  });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "PROPERTY_DELETE",
    entity: "Property",
    entityId: params.id,
    details: existing.assetName,
    ipAddress: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
