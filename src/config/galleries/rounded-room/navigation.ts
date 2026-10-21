import type {
  NavigationNode,
  NavigationPath,
  Vector3Tuple,
} from "@/features/navigation/navigation-types";

export const EYE_HEIGHT = 1.65;
export const MAX_NAVIGATION_EDGE_LENGTH = 2.4;

const point = (x: number, z: number): Vector3Tuple => [x, EYE_HEIGHT, z];
const target = (x: number, z: number): Vector3Tuple => [x, 1.45, z];

type LandmarkDefinition = Omit<NavigationNode, "kind" | "neighbors">;

const landmarkDefinitions = {
  entrance: {
    id: "entrance",
    label: "Giriş eşiği",
    shortLabel: "Giriş",
    position: point(0, 0.65),
    lookAt: target(0, -3.2),
  },
  passage: {
    id: "passage",
    label: "Giriş koridoru",
    shortLabel: "Koridor",
    position: point(-0.15, -3.99),
    lookAt: target(1.4, -8.2),
  },
  gallery_entry: {
    id: "gallery_entry",
    label: "Ana galeri açılışı",
    shortLabel: "Ana galeri",
    position: point(2.55, -9.49),
    lookAt: target(8.2, -13.2),
  },
  west_bay: {
    id: "west_bay",
    label: "Batı sergi bölümü",
    shortLabel: "Batı bölümü",
    position: point(6.05, -14.99),
    lookAt: target(8.1, -17.2),
  },
  west_turn: {
    id: "west_turn",
    label: "Çapraz duvarın arkası",
    shortLabel: "Duvar arkası",
    position: point(9.55, -18.49),
    lookAt: target(11.5, -14.1),
  },
  upper_bay: {
    id: "upper_bay",
    label: "Üst sergi rotası",
    shortLabel: "Üst rota",
    position: point(9.55, -10.99),
    lookAt: target(12, -13.2),
  },
  center_bay: {
    id: "center_bay",
    label: "Merkez sergi bölümü",
    shortLabel: "Merkez bölüm",
    position: point(11.05, -13.49),
    lookAt: target(14.5, -14.2),
  },
  east_turn: {
    id: "east_turn",
    label: "Doğu geçişi",
    shortLabel: "Doğu geçişi",
    position: point(14.55, -13.49),
    lookAt: target(15.5, -18.1),
  },
  rear_gallery: {
    id: "rear_gallery",
    label: "Arka galeri",
    shortLabel: "Arka galeri",
    position: point(15.55, -18.99),
    lookAt: target(16, -22.6),
  },
  corridor_entry: {
    id: "corridor_entry",
    label: "Uzun koridor girişi",
    shortLabel: "Koridor girişi",
    position: point(16.05, -22.99),
    lookAt: target(18, -29),
  },
  corridor_mid: {
    id: "corridor_mid",
    label: "Uzun koridor",
    shortLabel: "Koridor ortası",
    position: point(18.05, -29),
    lookAt: target(20.3, -35.3),
  },
  round_reveal: {
    id: "round_reveal",
    label: "Dairesel oda eşiği",
    shortLabel: "Dairesel oda",
    position: point(20.55, -36),
    lookAt: target(23.5, -40.8),
  },
  round_center: {
    id: "round_center",
    label: "Dairesel oda merkezi",
    shortLabel: "Oda merkezi",
    position: point(23.55, -40.99),
    lookAt: target(23.55, -45),
  },
  round_west: {
    id: "round_west",
    label: "Dairesel oda batı görünümü",
    shortLabel: "Batı görünümü",
    position: point(19.05, -41.49),
    lookAt: target(22.8, -41),
  },
  round_back: {
    id: "round_back",
    label: "Dairesel oda arka görünümü",
    shortLabel: "Arka görünüm",
    position: point(23.55, -45.49),
    lookAt: target(23.55, -41),
  },
  round_east: {
    id: "round_east",
    label: "Dairesel oda doğu görünümü",
    shortLabel: "Doğu görünümü",
    position: point(28.05, -40.99),
    lookAt: target(24.2, -41),
  },
} as const satisfies Record<string, LandmarkDefinition>;

export const navigationPaths: readonly NavigationPath[] = [
  { from: "entrance", to: "passage" },
  {
    from: "passage",
    to: "gallery_entry",
    waypoints: [point(0, -7.4)],
  },
  {
    from: "gallery_entry",
    to: "west_bay",
    waypoints: [point(6.45, -10)],
  },
  {
    from: "west_bay",
    to: "west_turn",
    waypoints: [point(7.55, -18.49)],
  },
  { from: "west_turn", to: "center_bay" },
  { from: "gallery_entry", to: "upper_bay" },
  { from: "upper_bay", to: "center_bay" },
  { from: "center_bay", to: "east_turn" },
  { from: "east_turn", to: "rear_gallery" },
  { from: "rear_gallery", to: "corridor_entry" },
  { from: "corridor_entry", to: "corridor_mid" },
  { from: "corridor_mid", to: "round_reveal" },
  {
    from: "round_reveal",
    to: "round_center",
    waypoints: [point(22, -38.6)],
  },
  { from: "round_center", to: "round_west" },
  { from: "round_west", to: "round_back" },
  { from: "round_center", to: "round_back" },
  { from: "round_center", to: "round_east" },
  { from: "round_back", to: "round_east" },
];

function distanceBetween(from: Vector3Tuple, to: Vector3Tuple) {
  return Math.hypot(to[0] - from[0], to[2] - from[2]);
}

function interpolate(from: Vector3Tuple, to: Vector3Tuple, amount: number): Vector3Tuple {
  return [
    from[0] + (to[0] - from[0]) * amount,
    EYE_HEIGHT,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function createDenseNavigationGraph() {
  const nodes: Record<string, NavigationNode> = {};
  const neighbors = new Map<string, Set<string>>();

  for (const landmark of Object.values(landmarkDefinitions)) {
    nodes[landmark.id] = {
      ...landmark,
      kind: "landmark",
      neighbors: [],
    };
    neighbors.set(landmark.id, new Set());
  }

  const connect = (from: string, to: string) => {
    neighbors.get(from)?.add(to);
    neighbors.get(to)?.add(from);
  };

  for (const path of navigationPaths) {
    const fromNode = nodes[path.from];
    const toNode = nodes[path.to];

    if (!fromNode || !toNode) {
      throw new Error(`Navigation path references an unknown node: ${path.from} -> ${path.to}`);
    }

    const routePoints = [fromNode.position, ...(path.waypoints ?? []), toNode.position];
    let previousId = fromNode.id;

    for (let segmentIndex = 0; segmentIndex < routePoints.length - 1; segmentIndex += 1) {
      const segmentStart = routePoints[segmentIndex];
      const segmentEnd = routePoints[segmentIndex + 1];
      const stepCount = Math.max(
        1,
        Math.ceil(distanceBetween(segmentStart, segmentEnd) / MAX_NAVIGATION_EDGE_LENGTH),
      );

      for (let step = 1; step <= stepCount; step += 1) {
        const isDestination = segmentIndex === routePoints.length - 2 && step === stepCount;
        const nodeId = isDestination
          ? toNode.id
          : `${path.from}__${path.to}__${segmentIndex}_${step}`;
        const position = interpolate(segmentStart, segmentEnd, step / stepCount);

        if (!isDestination) {
          nodes[nodeId] = {
            id: nodeId,
            kind: "waypoint",
            label: `${fromNode.shortLabel} – ${toNode.shortLabel}`,
            shortLabel: "İlerle",
            position,
            lookAt: target(segmentEnd[0], segmentEnd[2]),
            neighbors: [],
          };
          neighbors.set(nodeId, new Set());
        }

        connect(previousId, nodeId);
        previousId = nodeId;
      }
    }
  }

  for (const [id, node] of Object.entries(nodes)) {
    nodes[id] = { ...node, neighbors: [...(neighbors.get(id) ?? [])] };
  }

  return nodes;
}

export const navigationNodes = createDenseNavigationGraph();
export type NavigationNodeId = string;

export function getNavigationNode(id: string): NavigationNode {
  const node = navigationNodes[id];

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

export function findShortestNavigationPath(from: string, to: string): string[] {
  if (!navigationNodes[from] || !navigationNodes[to]) {
    return [];
  }

  const distances = new Map<string, number>([[from, 0]]);
  const previous = new Map<string, string>();
  const unvisited = new Set(Object.keys(navigationNodes));

  while (unvisited.size > 0) {
    let current: string | null = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    for (const candidate of unvisited) {
      const candidateDistance = distances.get(candidate) ?? Number.POSITIVE_INFINITY;

      if (candidateDistance < currentDistance) {
        current = candidate;
        currentDistance = candidateDistance;
      }
    }

    if (!current || current === to) {
      break;
    }

    unvisited.delete(current);

    for (const neighborId of navigationNodes[current].neighbors) {
      if (!unvisited.has(neighborId)) {
        continue;
      }

      const nextDistance = currentDistance + distanceBetween(
        navigationNodes[current].position,
        navigationNodes[neighborId].position,
      );

      if (nextDistance < (distances.get(neighborId) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighborId, nextDistance);
        previous.set(neighborId, current);
      }
    }
  }

  if (from !== to && !previous.has(to)) {
    return [];
  }

  const path = [to];

  while (path[0] !== from) {
    const parent = previous.get(path[0]);

    if (!parent) {
      return [];
    }

    path.unshift(parent);
  }

  return path;
}

export function getNearestNavigationNode(position: Vector3Tuple): NavigationNode {
  const [firstNode, ...remainingNodes] = Object.values(navigationNodes);

  if (!firstNode) {
    throw new Error("Navigation graph is empty.");
  }

  return remainingNodes.reduce((nearest, candidate) => (
    distanceBetween(candidate.position, position) < distanceBetween(nearest.position, position)
      ? candidate
      : nearest
  ), firstNode);
}

function getRouteLength(path: string[]) {
  return path.slice(1).reduce(
    (total, id, index) => total + distanceBetween(
      navigationNodes[path[index]].position,
      navigationNodes[id].position,
    ),
    0,
  );
}

export function getSuggestedDestinations(
  currentNodeId: string,
  limit = 4,
): NavigationNode[] {
  const candidates = Object.values(navigationNodes)
    .filter((node) => node.kind === "landmark" && node.id !== currentNodeId)
    .map((node) => ({
      node,
      path: findShortestNavigationPath(currentNodeId, node.id),
    }))
    .filter(({ path }) => path.length > 0)
    .sort((left, right) => getRouteLength(left.path) - getRouteLength(right.path));
  const nearestByDirection = new Map<string, NavigationNode>();

  for (const candidate of candidates) {
    const firstStep = candidate.path[1];

    if (firstStep && !nearestByDirection.has(firstStep)) {
      nearestByDirection.set(firstStep, candidate.node);
    }
  }

  return [...nearestByDirection.values()]
    .slice(0, limit)
    .map((node) => node);
}
