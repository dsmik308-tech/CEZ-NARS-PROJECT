"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  BookMarked,
  FileSpreadsheet,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Plus,
  ScrollText,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { roleLabel } from "@/lib/permissions";
import { useAuth } from "@/components/auth-provider";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: "create" | "manageUsers" | "manageMaster" | "viewAudit";
};

const nav: NavItem[] = [
  { href: "/registry", label: "Registry", icon: LayoutDashboard },
  { href: "/registry/new", label: "Create Asset", icon: Plus, permission: "create" },
  { href: "/map", label: "GIS Map", icon: Map },
  { href: "/reports/summary", label: "NARS Summary", icon: FileSpreadsheet },
  { href: "/admin/master-data", label: "Reference / Master Data", icon: BookMarked, permission: "manageMaster" },
  { href: "/admin/users", label: "User Management", icon: Users, permission: "manageUsers" },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText, permission: "viewAudit" },
  { href: "/account", label: "My Account", icon: KeyRound },
  { href: "/", label: "Landing Page", icon: Building2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, allowed, logout } = useAuth();

  const visibleNav = nav.filter((item) => !item.permission || allowed(item.permission));

  const links = (
    <nav className="mt-8 grid gap-1 text-sm font-semibold">
      {visibleNav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/registry"
            ? pathname === "/registry" ||
              (pathname.startsWith("/registry/") && !pathname.startsWith("/registry/new"))
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 transition",
              active
                ? "bg-[#082664] text-white shadow-lg shadow-blue-950/20"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const profile = (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signed in</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {user?.fullName || "PEZA User"}
      </p>
      <p className="text-xs text-slate-500">{roleLabel(user?.role)}</p>
      <button
        type="button"
        onClick={() => logout()}
        className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-600"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border bg-white">
            <Image src="/assets/peza-logo.png" alt="PEZA logo" fill className="object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              PEZA
            </p>
            <h1 className="font-black text-[#082664]">NARS</h1>
          </div>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{links}</div>
        <div className="pt-4">{profile}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-black text-[#082664]">PEZA NARS</p>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{links}</div>
            {profile}
          </aside>
        </div>
      )}

      <main className="lg:pl-72">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-black text-[#082664]">PEZA NARS</p>
          <span className="w-5" />
        </header>
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
