"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, ImageOverlay, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CEZ_BOUNDS, CEZ_MAP_URL, CEZ_PHASES } from "@/lib/map";
import { kindLabel, peso } from "@/lib/utils";
import type { PropertyRecord } from "@/types";

function kindIcon(kind: string, active = false) {
  const color =
    kind === "LAND" ? "#0c43a8" : kind === "BUILDING" ? "#d40000" : "#ca8a04";
  const size = active ? 34 : 26;
  return L.divIcon({
    className: "peza-marker",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:999px;
      background:${color};border:3px solid white;
      box-shadow:0 8px 18px rgba(6,27,73,.35);
      display:flex;align-items:center;justify-content:center;
      color:white;font:700 11px/1 sans-serif;
    ">${kind === "LAND" ? "L" : kind === "BUILDING" ? "B" : "S"}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

const pickIcon = L.divIcon({
  className: "peza-marker",
  html: `<div style="
    width:22px;height:22px;border-radius:999px;
    background:#14b8e6;border:3px solid white;
    box-shadow:0 0 0 6px rgba(20,184,230,.25);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(CEZ_BOUNDS, { padding: [12, 12] });
  }, [map]);
  return null;
}

function MapClickCapture({
  onPick,
}: {
  onPick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick?.(Number(e.latlng.lat.toFixed(2)), Number(e.latlng.lng.toFixed(2)));
    },
  });
  return null;
}

export function CezMap({
  selectable = false,
  onPick,
  picked,
  highlightId,
  compact = false,
}: {
  selectable?: boolean;
  onPick?: (lat: number, lng: number) => void;
  picked?: { lat: number; lng: number } | null;
  highlightId?: string;
  compact?: boolean;
}) {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then(setProperties)
      .catch(() => setProperties([]));
  }, []);

  const mapped = useMemo(
    () =>
      properties.filter(
        (p) =>
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          !(p.latitude === 0 && p.longitude === 0)
      ),
    [properties]
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0c43a8]">
            CEZ Master Plan · January 2023
          </p>
          <p className="text-sm text-slate-600">
            {selectable
              ? "Click the plan to pin this asset to a lot, block, or phase."
              : "Markers are GIS-linked NARS land, building, and specialized assets."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CEZ_PHASES.slice(0, 4).map((phase) => (
            <span
              key={phase.id}
              className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600"
            >
              <span className="h-2.5 w-2.5 rounded-full border" style={{ background: phase.color }} />
              {phase.label}
            </span>
          ))}
        </div>
      </div>
      <MapContainer
        crs={L.CRS.Simple}
        center={[CEZ_BOUNDS[1][0] / 2, CEZ_BOUNDS[1][1] / 2]}
        zoom={-1}
        minZoom={-2}
        maxZoom={2}
        maxBounds={CEZ_BOUNDS}
        attributionControl={false}
        style={{ height: compact ? "420px" : "72vh", width: "100%" }}
      >
        <FitBounds />
        <ImageOverlay url={CEZ_MAP_URL} bounds={CEZ_BOUNDS} />
        {selectable && <MapClickCapture onPick={onPick} />}

        {mapped.map((property) => (
          <Marker
            key={property.id}
            icon={kindIcon(property.propertyKind, property.id === highlightId)}
            position={[property.latitude as number, property.longitude as number]}
          >
            <Popup>
              <div className="min-w-56">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {kindLabel(property.propertyKind)}
                </p>
                <h3 className="text-base font-black text-[#082664]">{property.assetName}</h3>
                <p className="mt-1 text-sm text-slate-600">{property.assetDescription}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {[property.cezPhase, property.cezBlock, property.cezLot].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  NBV {peso(property.netBookValue)}
                </p>
                <Link
                  href={`/registry/${property.id}`}
                  className="mt-3 inline-block rounded-lg bg-[#082664] px-3 py-2 text-xs font-bold text-white"
                >
                  View NARS Record
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {picked && typeof picked.lat === "number" && typeof picked.lng === "number" && (
          <Marker icon={pickIcon} position={[picked.lat, picked.lng]}>
            <Popup>Selected map pin</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
