import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [assets, users] = await Promise.all([
    prisma.property.count(),
    prisma.user.count({ where: { active: true } }).catch(() => 0),
  ]);

  return NextResponse.json({ assets, users });
}
