export const CEZ_MAP_WIDTH = 2526;
export const CEZ_MAP_HEIGHT = 1785;
export const CEZ_MAP_URL = "/assets/cez-master-plan.jpg";

export const CEZ_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [CEZ_MAP_HEIGHT, CEZ_MAP_WIDTH],
];

export const CEZ_PHASES = [
  { id: "Phase 1", color: "#f4d35e", label: "Phase 1" },
  { id: "Phase 2", color: "#e879a8", label: "Phase 2" },
  { id: "Phase 3", color: "#f2a7a0", label: "Phase 3" },
  { id: "Phase 4", color: "#7dd3f0", label: "Phase 4" },
  { id: "Phase 4 Expansion", color: "#f6e27a", label: "Phase 4 Expansion" },
  { id: "CEZ II", color: "#f0b27a", label: "CEZ II" },
  { id: "CEZ I Annex", color: "#ffffff", label: "CEZ I Annex" },
] as const;
