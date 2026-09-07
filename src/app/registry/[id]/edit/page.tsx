import { AppShell } from "@/components/app-shell";
import { PropertyForm } from "@/components/property-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
  });

  if (!property) notFound();

  const initial = JSON.parse(JSON.stringify(property));

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
          Update NARS Record
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{property.assetName}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Changes are written to the central property database and immediately reflected in the GIS
          map and NARS summary.
        </p>
      </div>
      <PropertyForm initial={initial} />
    </AppShell>
  );
}
