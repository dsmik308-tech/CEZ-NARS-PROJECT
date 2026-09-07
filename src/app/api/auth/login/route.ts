import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { clientIp, cookieOptions, publicUser, verifyPassword } from "@/lib/auth";
import { COOKIE_NAME, maxAgeSeconds, signAuthToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const identifier = String(body.username || body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const remember = Boolean(body.remember);
  const ip = clientIp(req);

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Username and password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: identifier } },
        { email: { equals: identifier } },
      ],
    },
  });

  if (!user) {
    await writeAudit({
      action: "LOGIN_FAILED",
      details: `Unknown account: ${identifier}`,
      ipAddress: ip,
    });
    return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
  }

  if (!user.active) {
    await writeAudit({
      userId: user.id,
      username: user.username,
      action: "LOGIN_BLOCKED",
      details: "Inactive account",
      ipAddress: ip,
    });
    return NextResponse.json(
      { message: "This account has been deactivated. Contact PEZA ICT." },
      { status: 403 }
    );
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    await writeAudit({
      userId: user.id,
      username: user.username,
      action: "LOGIN_LOCKED",
      details: `Locked for ${minutes} more minute(s)`,
      ipAddress: ip,
    });
    return NextResponse.json(
      { message: `Account locked after failed attempts. Try again in ${minutes} minute(s).` },
      { status: 423 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const failedAttempts = user.failedAttempts + 1;
    const lockedUntil =
      failedAttempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts, lockedUntil },
    });

    await writeAudit({
      userId: user.id,
      username: user.username,
      action: "LOGIN_FAILED",
      details: lockedUntil
        ? `Locked after ${failedAttempts} failed attempts`
        : `Attempt ${failedAttempts} of ${MAX_ATTEMPTS}`,
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        message: lockedUntil
          ? `Account locked for ${LOCK_MINUTES} minutes after ${MAX_ATTEMPTS} failed attempts.`
          : "Invalid username or password.",
      },
      { status: lockedUntil ? 423 : 401 }
    );
  }

  const _signedIn = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const maxAge = maxAgeSeconds(remember);
  const token = await signAuthToken(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    },
    maxAge
  );

  await writeAudit({
    userId: user.id,
    username: user.username,
    action: "LOGIN",
    details: remember ? "Remembered session" : "Standard session",
    ipAddress: ip,
  });

  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(COOKIE_NAME, token, cookieOptions(maxAge));
  return res;
}
