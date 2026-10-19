import type {
  NavigationNode,
  NavigationPath,
  Vector3Tuple,
} from "@/features/navigation/navigation-types";

export const EYE_HEIGHT = 1.65;

const point = (x: number, z: number): Vector3Tuple => [x, EYE_HEIGHT, z];
const target = (x: number, z: number): Vector3Tuple => [x, 1.45, z];

export const navigationNodes = {
  entrance: {
    id: "entrance",
    label: "Giriş eşiği",
    shortLabel: "Giriş",
    position: point(0, 0.65),
    lookAt: target(0, -3.2),
    neighbors: ["passage"],
  },
  passage: {
    id: "passage",
    label: "Giriş koridoru",
    shortLabel: "Koridor",
    position: point(-0.15, -3.99),
    lookAt: target(1.4, -8.2),
    neighbors: ["entrance", "gallery_entry"],
  },
  gallery_entry: {
    id: "gallery_entry",
    label: "Ana galeri açılışı",
    shortLabel: "Ana galeri",
    position: point(2.55, -9.49),
    lookAt: target(8.2, -13.2),
    neighbors: ["passage", "west_bay", "upper_bay"],
  },
  west_bay: {
    id: "west_bay",
    label: "Batı sergi bölümü",
    shortLabel: "Batı bölümü",
    position: point(6.05, -14.99),
    lookAt: target(8.1, -17.2),
    neighbors: ["gallery_entry", "west_turn"],
  },
  west_turn: {
    id: "west_turn",
    label: "Çapraz duvarın arkası",
    shortLabel: "Duvar arkası",
    position: point(9.55, -18.49),
    lookAt: target(11.5, -14.1),
    neighbors: ["west_bay", "center_bay"],
  },
  upper_bay: {
    id: "upper_bay",
    label: "Üst sergi rotası",
    shortLabel: "Üst rota",
    position: point(9.55, -10.99),
    lookAt: target(12.0, -13.2),
    neighbors: ["gallery_entry", "center_bay"],
  },
  center_bay: {
    id: "center_bay",
    label: "Merkez sergi bölümü",
    shortLabel: "Merkez bölüm",
    position: point(11.05, -13.49),
    lookAt: target(14.5, -14.2),
    neighbors: ["west_turn", "upper_bay", "east_turn"],
  },
  east_turn: {
    id: "east_turn",
    label: "Doğu geçişi",
    shortLabel: "Doğu geçişi",
    position: point(14.55, -13.49),
    lookAt: target(15.5, -18.1),
    neighbors: ["center_bay", "rear_gallery"],
  },
  rear_gallery: {
    id: "rear_gallery",
    label: "Arka galeri",
    shortLabel: "Arka galeri",
    position: point(15.55, -18.99),
    lookAt: target(16.0, -22.6),
    neighbors: ["east_turn", "corridor_entry"],
  },
  corridor_entry: {
    id: "corridor_entry",
    label: "Uzun koridor girişi",
    shortLabel: "Koridor girişi",
    position: point(16.05, -22.99),
    lookAt: target(18.0, -29.0),
    neighbors: ["rear_gallery", "corridor_mid"],
  },
  corridor_mid: {
    id: "corridor_mid",
    label: "Uzun koridor",
    shortLabel: "Koridor ortası",
    position: point(18.05, -29.0),
    lookAt: target(20.3, -35.3),
    neighbors: ["corridor_entry", "round_reveal"],
  },
  round_reveal: {
    id: "round_reveal",
    label: "Dairesel oda eşiği",
    shortLabel: "Dairesel oda",
    position: point(20.55, -36.0),
    lookAt: target(23.5, -40.8),
    neighbors: ["corridor_mid", "round_center"],
  },
  round_center: {
    id: "round_center",
    label: "Dairesel oda merkezi",
    shortLabel: "Oda merkezi",
    position: point(23.55, -40.99),
    lookAt: target(23.55, -45.0),
    neighbors: ["round_reveal", "round_west", "round_back", "round_east"],
  },
  round_west: {
    id: "round_west",
    label: "Dairesel oda batı görünümü",
    shortLabel: "Batı görünümü",
    position: point(19.05, -41.49),
    lookAt: target(22.8, -41.0),
    neighbors: ["round_center", "round_back"],
  },
  round_back: {
    id: "round_back",
    label: "Dairesel oda arka görünümü",
    shortLabel: "Arka görünüm",
    position: point(23.55, -45.49),
    lookAt: target(23.55, -41.0),
    neighbors: ["round_west", "round_center", "round_east"],
  },
  round_east: {
    id: "round_east",
    label: "Dairesel oda doğu görünümü",
    shortLabel: "Doğu görünümü",
    position: point(28.05, -40.99),
    lookAt: target(24.2, -41.0),
    neighbors: ["round_center", "round_back"],
  },
} as const satisfies Record<string, NavigationNode>;

export type NavigationNodeId = keyof typeof navigationNodes;

export const navigationPaths: readonly NavigationPath[] = [
  {
    from: "west_bay",
    to: "west_turn",
    waypoints: [point(7.55, -18.49)],
  },
  {
    from: "round_reveal",
    to: "round_center",
    waypoints: [point(22.0, -38.6)],
  },
];

export function getNavigationNode(id: string): NavigationNode {
  const node = navigationNodes[id as NavigationNodeId];

  if (!node) {
    throw new Error(`Unknown navigation node: ${id}`);
  }

  return node;
}

export function getPathWaypoints(
  from: string,
  to: string,
): readonly Vector3Tuple[] {
  const forward = navigationPaths.find(
    (path) => path.from === from && path.to === to,
  );

  if (forward) {
    return forward.waypoints ?? [];
  }

  const reverse = navigationPaths.find(
    (path) => path.from === to && path.to === from,
  );

  return reverse?.waypoints ? [...reverse.waypoints].reverse() : [];
}
