import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission, requireUser } from "@/lib/auth";
import { propertySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const kind = searchParams.get("kind") || undefined;
  const regionId = searchParams.get("regionId") || undefined;
  const provinceId = searchParams.get("provinceId") || undefined;

  const validKind =
    kind && ["LAND", "BUILDING", "SPECIALIZED"].includes(kind) ? kind : undefined;

  const properties = await prisma.property.findMany({
    where: {
      AND: [
        validKind ? { propertyKind: validKind } : {},
        regionId ? { regionId } : {},
        provinceId ? { provinceId } : {},
        q
          ? {
              OR: [
                { assetName: { contains: q } },
                { assetDescription: { contains: q } },
                { accountCode: { contains: q } },
                { cezPhase: { contains: q } },
                { cezBlock: { contains: q } },
                { cityMunicipality: { contains: q } },
              ],
            }
          : {},
      ],
    },
    include: {
      region: true,
      province: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(properties);
}

export async function POST(req: Request) {
  const { user, error } = await requirePermission("create");
  if (error || !user) return error!;

  const body = await req.json();
  const parsed = propertySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const property = await prisma.property.create({
    data: parsed.data,
  });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "PROPERTY_CREATE",
    entity: "Property",
    entityId: property.id,
    details: property.assetName,
    ipAddress: clientIp(req),
  });

  return NextResponse.json(property, { status: 201 });
}
