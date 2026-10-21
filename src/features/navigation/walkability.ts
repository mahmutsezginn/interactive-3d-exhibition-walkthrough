import { Mesh, Raycaster, Vector3 } from "three";

import type { Vector3Tuple } from "./navigation-types";

export const VISITOR_CLEARANCE = 0.35;

const SAMPLE_INTERVAL = 0.15;
const CLEARANCE_DIRECTIONS = 16;

function toVector3(value: Vector3Tuple) {
  return new Vector3(value[0], value[1], value[2]);
}

export function isWalkingSegmentClear(
  from: Vector3Tuple,
  to: Vector3Tuple,
  wallMeshes: Mesh[],
) {
  const start = toVector3(from);
  const end = toVector3(to);
  const distance = start.distanceTo(end);
  const sampleCount = Math.max(1, Math.ceil(distance / SAMPLE_INTERVAL));
  const raycaster = new Raycaster();

  for (let sample = 0; sample <= sampleCount; sample += 1) {
    const position = start.clone().lerp(end, sample / sampleCount);

    for (let directionIndex = 0; directionIndex < CLEARANCE_DIRECTIONS; directionIndex += 1) {
      const angle = directionIndex * Math.PI * 2 / CLEARANCE_DIRECTIONS;
      raycaster.set(
        position,
        new Vector3(Math.cos(angle), 0, Math.sin(angle)),
      );
      raycaster.far = VISITOR_CLEARANCE;

      const hit = raycaster.intersectObjects(wallMeshes, false)[0];

      if (hit && hit.distance < VISITOR_CLEARANCE) {
        return false;
      }
    }
  }

  return true;
}
