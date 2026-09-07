import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { clientIp, getCurrentUser } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  await writeAudit({
    userId: user?.id,
    username: user?.username,
    action: "LOGOUT",
    ipAddress: clientIp(req),
  });

  cookies().delete(COOKIE_NAME);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
