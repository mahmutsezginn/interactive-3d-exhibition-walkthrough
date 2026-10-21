export type Vector3Tuple = readonly [x: number, y: number, z: number];

export interface NavigationNode {
  id: string;
  kind: "landmark" | "waypoint";
  label: string;
  shortLabel: string;
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
  neighbors: readonly string[];
}

export interface NavigationPath {
  from: string;
  to: string;
  waypoints?: readonly Vector3Tuple[];
}

export interface FloorNavigationTarget {
  position: Vector3Tuple;
  directlyReachable: boolean;
  anchorNodeIds: readonly string[];
}
