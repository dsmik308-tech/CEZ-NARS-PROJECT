import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const moneyFields = {
  acquisitionCost: true,
  netBookValue: true,
  soundMarketValueAmount: true,
  accumulatedDepreciation: true,
  assessedValueAmount: true,
  appraisedValueAmount: true,
  improvementValueAmount: true,
  replacementValueAmount: true,
} as const;

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const regions = await prisma.region.findMany({
    orderBy: { name: "asc" },
  });

  const rows = [];

  for (const region of regions) {
    const buildings = await prisma.property.aggregate({
      where: { regionId: region.id, propertyKind: "BUILDING" },
      _count: { id: true },
      _sum: moneyFields,
    });

    const lands = await prisma.property.aggregate({
      where: { regionId: region.id, propertyKind: "LAND" },
      _count: { id: true },
      _sum: moneyFields,
    });

    const specialized = await prisma.property.aggregate({
      where: { regionId: region.id, propertyKind: "SPECIALIZED" },
      _count: { id: true },
      _sum: moneyFields,
    });

    rows.push({
      region: region.name,
      buildings,
      lands,
      specialized,
    });
  }

  const totals = await prisma.property.groupBy({
    by: ["propertyKind"],
    _count: { id: true },
    _sum: moneyFields,
  });

  return NextResponse.json({
    rows,
    totals,
  });
}
