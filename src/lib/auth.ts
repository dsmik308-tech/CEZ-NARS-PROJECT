import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, TokenPayload, verifyAuthToken } from "@/lib/jwt";
import { can, Permission } from "@/lib/permissions";

import type { AuthUser } from "@/types";

export type { AuthUser };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function publicUser(user: {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  office: string | null;
  lastLoginAt: Date | null;
}): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    office: user.office,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function getSessionFromToken(token?: string | null): Promise<TokenPayload | null> {
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
  });

  if (!user || !user.active) return null;
  return publicUser(user);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null as AuthUser | null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requirePermission(permission: Permission) {
  const { user, error } = await requireUser();
  if (error || !user) {
    return { user: null as AuthUser | null, error: error! };
  }
  if (!can(user.role, permission)) {
    return {
      user,
      error: NextResponse.json({ message: "You do not have permission for this action." }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
