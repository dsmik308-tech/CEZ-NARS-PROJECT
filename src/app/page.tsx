"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Database,
  FileSpreadsheet,
  Map,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

const features = [
  {
    icon: Map,
    title: "GIS-Linked Asset Registration",
    text: "Use the CEZ Master Plan as the spatial foundation for PEZA land and building records.",
  },
  {
    icon: Database,
    title: "Centralized Master Property Database",
    text: "One authoritative source for NARS land, building, legal, financial, insurance, and technical records.",
  },
  {
    icon: FileSpreadsheet,
    title: "Preserved NARS Templates",
    text: "Maintain the existing Bureau of the Treasury NARS report format and submission workflow.",
  },
  {
    icon: Workflow,
    title: "Automatic Summary Updates",
    text: "Every CRUD action recalculates regional totals and asset counts automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Government-Grade Controls",
    text: "Structured validation, dropdown master data, consistent records, and auditable data structure.",
  },
  {
    icon: Building2,
    title: "Land & Building Management",
    text: "Full Create, Read, Update, Delete for GIS-linked PEZA land parcels and building assets.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assets: 0, users: 0 });

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then((data) => setStats({ assets: data.assets || 0, users: data.users || 0 }))
      .catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative min-h-screen gov-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-[#061b49] via-[#082664] to-[#0c43a8]" />
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/assets/cez-master-plan.jpg"
            alt="CEZ Master Plan"
            fill
            priority
            className="object-cover mix-blend-screen"
          />
        </div>

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
              <Image src="/assets/peza-logo.png" alt="PEZA logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Philippine Economic Zone Authority
              </p>
              <h1 className="text-lg font-bold text-white">NARS</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#workflow" className="hover:text-white">
              Workflow
            </a>
            <a href="#trust" className="hover:text-white">
              Trust
            </a>
            {user ? (
              <Link
                href="/registry"
                className="rounded-full bg-white px-5 py-2 font-bold text-[#082664] shadow-xl"
              >
                Open Registry
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-white px-5 py-2 font-bold text-[#082664] shadow-xl"
              >
                Sign in
              </Link>
            )}
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/40 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
              National Asset Registry System for PEZA Properties
            </div>

            <h2 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
              A premium GIS-powered registry for national land and building assets.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50">
              Register, manage, locate, validate, and report PEZA non-financial assets through a
              secure, centralized, map-first NARS platform aligned with Bureau of the Treasury
              reporting procedures.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={user ? "/registry/new" : "/login?next=/registry/new"}
                className="rounded-2xl bg-white px-7 py-4 text-center font-bold text-[#082664] shadow-2xl shadow-black/20 transition hover:-translate-y-1"
              >
                {user ? "Register New Asset" : "Sign in to NARS"}
              </Link>
              <Link
                href={user ? "/map" : "/login?next=/map"}
                className="rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore CEZ GIS Map
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                  Registered assets
                </p>
                <p className="mt-1 text-3xl font-black text-white">{stats.assets}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                  Authorized officers
                </p>
                <p className="mt-1 text-3xl font-black text-white">{stats.users}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="glass-panel relative rounded-[2rem] p-4">
              <div className="rounded-[1.5rem] bg-slate-950 p-3 shadow-2xl">
                <Image
                  src="/assets/cez-master-plan.jpg"
                  alt="GIS foundation map"
                  width={900}
                  height={680}
                  className="rounded-xl object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden max-w-[220px] overflow-hidden rounded-2xl bg-white shadow-2xl sm:block">
                <Image
                  src="/assets/peza-building.jpg"
                  alt="PEZA building"
                  width={220}
                  height={160}
                  className="h-28 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Live Summary
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#082664]">Auto-Synced</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#0c43a8]">
          Enterprise Government Platform
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          Designed for accuracy, accountability, and national asset visibility.
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <feature.icon className="h-8 w-8 text-[#0c43a8]" />
              <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-[#061b49] px-6 py-28 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">
            Core Workflow
          </p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Master Data → GIS Registration → NARS Report
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-7">
            {[
              "Master Data",
              "GIS / Property Registration",
              "Create Land or Building Record",
              "Save",
              "Central Property Database",
              "NARS Summary",
              "Search / View / Edit / Delete",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-sm font-black text-cyan-200">0{index + 1}</p>
                <p className="mt-3 font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-7xl px-6 py-28">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <h2 className="text-3xl font-black">Built around the existing NARS procedure.</h2>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            The platform does not replace the NARS purpose or reporting logic. It strengthens the
            existing workflow through centralized records, searchable master data, GIS-linked
            registration, validation, CRUD management, and automatic summary synchronization.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/reports/summary"
              className="rounded-2xl bg-[#082664] px-7 py-4 font-bold text-white shadow-xl"
            >
              View NARS Summary Report
            </Link>
            <Link
              href="/registry"
              className="rounded-2xl border border-slate-300 px-7 py-4 font-bold text-[#082664]"
            >
              Open Property Database
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
