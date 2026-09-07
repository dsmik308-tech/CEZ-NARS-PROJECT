import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

function codeOf(name: string) {
  return name.toUpperCase().replaceAll(" ", "_").replaceAll("-", "_");
}

export async function POST(req: Request) {
  const { user, error } = await requirePermission("manageMaster");
  if (error || !user) return error!;

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const code = String(body.code || "").trim() || codeOf(name);

  if (!name) {
    return NextResponse.json({ message: "Region name is required." }, { status: 400 });
  }

  const created = await prisma.region.create({ data: { name, code } });
  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "REGION_CREATE",
    entity: "Region",
    entityId: created.id,
    details: name,
    ipAddress: clientIp(req),
  });
  return NextResponse.json(created, { status: 201 });
}
