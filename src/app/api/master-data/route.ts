import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission, requireUser } from "@/lib/auth";
import { parseMetadata } from "@/lib/master-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const regionId = searchParams.get("regionId");
  const assetType = searchParams.get("assetType");
  const includeInactive = searchParams.get("includeInactive") === "1";

  if (category === "REGIONS") {
    const regions = await prisma.region.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { provinces: true, properties: true } } },
    });
    return NextResponse.json(regions);
  }

  if (category === "PROVINCES") {
    const provinces = await prisma.province.findMany({
      where: regionId ? { regionId } : undefined,
      include: { region: true, _count: { select: { properties: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(provinces);
  }

  const options = await prisma.masterOption.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(includeInactive ? {} : { active: true }),
    },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  const filtered =
    category === "ACCOUNT_CODE" && assetType
      ? options.filter((option) => {
          const meta = parseMetadata(option.metadata);
          return meta.assetType === assetType || option.label.toUpperCase().includes("OTHERS");
        })
      : options;

  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const body = await req.json().catch(() => ({}));
  const category = String(body.category || "").trim();
  const label = String(body.label || "").trim();
  const code = String(body.code || "").trim() || null;
  const metadata =
    body.metadata && typeof body.metadata === "object"
      ? JSON.stringify(body.metadata)
      : typeof body.metadata === "string"
      ? body.metadata
      : null;
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  const active = body.active !== false;

  if (!category || !label) {
    return NextResponse.json({ message: "Category and label are required." }, { status: 400 });
  }

  const created = await prisma.masterOption.create({
    data: { category, label, code, metadata, sortOrder, active },
  });

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "MASTER_CREATE",
    entity: "MasterOption",
    entityId: created.id,
    details: `${category}: ${label}`,
    ipAddress: clientIp(req),
  });

  return NextResponse.json(created, { status: 201 });
}
