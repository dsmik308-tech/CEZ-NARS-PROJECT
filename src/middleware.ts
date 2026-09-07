import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyAuthToken } from "@/lib/jwt";
import { can } from "@/lib/permissions";

function loginRedirect(req: NextRequest) {
  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyAuthToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return loginRedirect(req);
  }

  const isAuditRoute = pathname.startsWith("/admin/audit") || pathname.startsWith("/api/audit");
  const isUserAdminRoute =
    pathname.startsWith("/api/users") ||
    (pathname.startsWith("/admin") && !pathname.startsWith("/admin/audit"));
  const needsCreate =
    pathname === "/registry/new" || pathname.startsWith("/registry/new/");
  const needsEdit = /\/registry\/[^/]+\/edit/.test(pathname);

  if (isAuditRoute && !can(session.role, "viewAudit")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  if (isUserAdminRoute && !can(session.role, "manageUsers")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  if (needsCreate && !can(session.role, "create")) {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  if (needsEdit && !can(session.role, "edit")) {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  const headers = new Headers(req.headers);
  headers.set("x-user-id", session.sub);
  headers.set("x-user-role", session.role);
  headers.set("x-user-name", session.fullName);

  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: [
    "/registry/:path*",
    "/map/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/api/properties/:path*",
    "/api/summary/:path*",
    "/api/master-data/:path*",
    "/api/users/:path*",
    "/api/audit/:path*",
  ],
};
