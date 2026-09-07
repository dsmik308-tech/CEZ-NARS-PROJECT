import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission } from "@/lib/auth";
import { MASTER_CATALOG, PROVINCE_CATALOG, REGION_CATALOG } from "@/lib/nars-master-catalog";

export const dynamic = "force-dynamic";

function codeOf(name: string) {
  return name.toUpperCase().replaceAll(" ", "_").replaceAll("-", "_");
}

export async function POST(req: Request) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  for (const region of REGION_CATALOG) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: { name: region.name },
      create: region,
    });
  }

  for (const [regionCode, provinces] of Object.entries(PROVINCE_CATALOG)) {
    const region = await prisma.region.findUniqueOrThrow({ where: { code: regionCode } });
    const allowed = new Set(provinces);
    for (const provinceName of provinces) {
      await prisma.province.upsert({
        where: {
          code_regionId: {
            code: codeOf(provinceName),
            regionId: region.id,
          },
        },
        update: { name: provinceName },
        create: {
          code: codeOf(provinceName),
          name: provinceName,
          regionId: region.id,
        },
      });
    }

    const extras = await prisma.province.findMany({
      where: { regionId: region.id },
      include: { _count: { select: { properties: true } } },
    });
    for (const extra of extras) {
      if (!allowed.has(extra.name) && extra._count.properties === 0) {
        await prisma.province.delete({ where: { id: extra.id } });
      }
    }
  }

  await prisma.masterOption.deleteMany({
    where: { category: { in: Object.keys(MASTER_CATALOG) } },
  });

  for (const [category, values] of Object.entries(MASTER_CATALOG)) {
    await prisma.masterOption.createMany({
      data: values.map((item, index) => ({
        category,
        label: item.label,
        code: item.code || item.label,
        metadata: item.metadata ? JSON.stringify(item.metadata) : null,
        sortOrder: index,
        active: true,
      })),
    });
  }

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "MASTER_RESTORE",
    entity: "MasterOption",
    details: "Restored official NARS reference lists",
    ipAddress: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
