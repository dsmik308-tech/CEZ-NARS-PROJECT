import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requirePermission("viewAudit");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const take = Math.min(Number(searchParams.get("take") || 200), 500);

  const logs = await prisma.auditLog.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q } },
            { action: { contains: q } },
            { entity: { contains: q } },
            { details: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(logs);
}
