import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "peza_nars_session";
export const SESSION_HOURS = 8;
export const REMEMBER_DAYS = 7;

export type TokenPayload = {
  sub: string;
  username: string;
  role: string;
  fullName: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: TokenPayload, maxAgeSeconds: number) {
  return new SignJWT({
    username: payload.username,
    role: payload.role,
    fullName: payload.fullName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.username !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
      fullName: typeof payload.fullName === "string" ? payload.fullName : payload.username,
    };
  } catch {
    return null;
  }
}

export function maxAgeSeconds(remember: boolean) {
  return remember ? REMEMBER_DAYS * 24 * 60 * 60 : SESSION_HOURS * 60 * 60;
}
