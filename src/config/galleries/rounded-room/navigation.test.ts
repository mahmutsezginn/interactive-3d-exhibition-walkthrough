import { readFileSync } from "node:fs";

import {
  DoubleSide,
  Mesh,
  Raycaster,
  Vector3,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { describe, expect, it } from "vitest";

import { isWalkingSegmentClear } from "../../../features/navigation/walkability";

import {
  GALLERY_MODEL_POSITION,
  GALLERY_MODEL_SCALE,
} from "./model";
import {
  findShortestNavigationPath,
  getNearestNavigationNode,
  getPathWaypoints,
  getSuggestedDestinations,
  MAX_NAVIGATION_EDGE_LENGTH,
  navigationNodes,
} from "./navigation";

const CAMERA_CLEARANCE = 0.35;
const ENDPOINT_EPSILON = 0.02;
const MODEL_PATH = new URL(
  "../../../../public/galleries/rounded-room/gallery.obj",
  import.meta.url,
);

function toVector3(value: readonly [number, number, number]) {
  return new Vector3(value[0], value[1], value[2]);
}

function loadWallMeshes() {
  const model = new OBJLoader().parse(readFileSync(MODEL_PATH, "utf8"));
  model.position.copy(toVector3(GALLERY_MODEL_POSITION));
  model.scale.setScalar(GALLERY_MODEL_SCALE);
  model.updateMatrixWorld(true);

  const walls: Mesh[] = [];

  model.traverse((object) => {
    if (!(object instanceof Mesh) || !object.name.startsWith("wall_")) {
      return;
    }

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      material.side = DoubleSide;
    });
    walls.push(object);
  });

  return walls;
}

const wallMeshes = loadWallMeshes();

function getRoutePoints(from: string, to: string) {
  return [
    navigationNodes[from as keyof typeof navigationNodes].position,
    ...getPathWaypoints(from, to),
    navigationNodes[to as keyof typeof navigationNodes].position,
  ].map(toVector3);
}

describe("rounded-room navigation graph", () => {
  it("only points to nodes that exist", () => {
    for (const node of Object.values(navigationNodes)) {
      for (const neighbor of node.neighbors) {
        expect(navigationNodes).toHaveProperty(neighbor);
      }
    }
  });

  it("uses bidirectional edges", () => {
    for (const node of Object.values(navigationNodes)) {
      for (const neighborId of node.neighbors) {
        const neighbor = navigationNodes[neighborId as keyof typeof navigationNodes];
        expect(neighbor.neighbors).toContain(node.id);
      }
    }
  });

  it("keeps every camera at the agreed eye height", () => {
    for (const node of Object.values(navigationNodes)) {
      expect(node.position[1]).toBe(1.65);
    }
  });

  it("densifies the graph with short walking steps", () => {
    expect(Object.keys(navigationNodes)).toHaveLength(50);

    for (const node of Object.values(navigationNodes)) {
      for (const neighborId of node.neighbors) {
        const distance = toVector3(node.position).distanceTo(
          toVector3(navigationNodes[neighborId].position),
        );
        expect(distance).toBeLessThanOrEqual(MAX_NAVIGATION_EDGE_LENGTH + 0.001);
      }
    }
  });

  it("finds a connected route between distant landmarks", () => {
    const route = findShortestNavigationPath("entrance", "round_center");

    expect(route[0]).toBe("entrance");
    expect(route.at(-1)).toBe("round_center");

    for (let index = 0; index < route.length - 1; index += 1) {
      expect(navigationNodes[route[index]].neighbors).toContain(route[index + 1]);
    }
  });

  it("maps a floor position to the nearest dense node", () => {
    expect(getNearestNavigationNode([0, 1.65, -2.1]).id).toContain(
      "entrance__passage",
    );
  });

  it("accepts the passage between detached walls and rejects crossing a wall", () => {
    expect(isWalkingSegmentClear(
      navigationNodes.west_bay.position,
      [6.8, 1.65, -16.5],
      wallMeshes,
    )).toBe(true);
    expect(isWalkingSegmentClear(
      [6.8, 1.65, -15],
      [9.5, 1.65, -15],
      wallMeshes,
    )).toBe(false);
  });

  it("suggests the nearest landmark in each available direction", () => {
    expect(
      getSuggestedDestinations("gallery_entry").map((node) => node.id),
    ).toEqual(expect.arrayContaining(["passage", "west_bay", "upper_bay"]));
  });

  it("keeps every route outside the gallery walls", () => {
    const raycaster = new Raycaster();
    const checkedEdges = new Set<string>();
    const collisions: string[] = [];

    for (const node of Object.values(navigationNodes)) {
      for (const neighborId of node.neighbors) {
        const edgeKey = [node.id, neighborId].sort().join("|");

        if (checkedEdges.has(edgeKey)) {
          continue;
        }

        checkedEdges.add(edgeKey);
        const points = getRoutePoints(node.id, neighborId);

        for (let index = 0; index < points.length - 1; index += 1) {
          const direction = points[index + 1].clone().sub(points[index]);
          const segmentLength = direction.length();
          raycaster.set(points[index], direction.normalize());
          raycaster.far = segmentLength;

          const hits = raycaster.intersectObjects(wallMeshes, false).filter(
            (hit) => hit.distance > ENDPOINT_EPSILON
              && hit.distance < segmentLength - ENDPOINT_EPSILON,
          );

          for (const hit of hits) {
            collisions.push(`${node.id} -> ${neighborId}: ${hit.object.name}`);
          }
        }
      }
    }

    expect(collisions).toEqual([]);
  });

  it("maintains visitor clearance along every route", () => {
    const raycaster = new Raycaster();
    const checkedEdges = new Set<string>();
    const clearanceViolations: string[] = [];

    for (const node of Object.values(navigationNodes)) {
      for (const neighborId of node.neighbors) {
        const edgeKey = [node.id, neighborId].sort().join("|");

        if (checkedEdges.has(edgeKey)) {
          continue;
        }

        checkedEdges.add(edgeKey);
        const points = getRoutePoints(node.id, neighborId);

        for (let index = 0; index < points.length - 1; index += 1) {
          const segmentLength = points[index].distanceTo(points[index + 1]);
          const sampleCount = Math.max(1, Math.ceil(segmentLength / 0.15));

          for (let sample = 0; sample <= sampleCount; sample += 1) {
            const position = points[index].clone().lerp(
              points[index + 1],
              sample / sampleCount,
            );

            for (let directionIndex = 0; directionIndex < 16; directionIndex += 1) {
              const angle = directionIndex * Math.PI / 8;
              raycaster.set(
                position,
                new Vector3(Math.cos(angle), 0, Math.sin(angle)),
              );
              raycaster.far = CAMERA_CLEARANCE;

              const hit = raycaster.intersectObjects(wallMeshes, false)[0];

              if (hit && hit.distance < CAMERA_CLEARANCE) {
                clearanceViolations.push(
                  `${node.id} -> ${neighborId}: ${hit.object.name}`,
                );
                break;
              }
            }
          }
        }
      }
    }

    expect(clearanceViolations).toEqual([]);
  });
});
