import { prisma } from "@/lib/prisma";

export async function writeAudit(entry: {
  userId?: string | null;
  username?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        username: entry.username || null,
        action: entry.action,
        entity: entry.entity || null,
        entityId: entry.entityId || null,
        details: entry.details || null,
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}
