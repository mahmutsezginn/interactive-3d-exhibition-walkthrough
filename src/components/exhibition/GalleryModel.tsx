"use client";

import { type ThreeEvent, useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  DoubleSide,
  Material,
  Mesh,
  MeshPhongMaterial,
  Object3D,
} from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import {
  GALLERY_MODEL_MATERIAL_URL,
  GALLERY_MODEL_OBJ_URL,
  GALLERY_MODEL_POSITION,
  GALLERY_MODEL_SCALE,
} from "@/config/galleries/rounded-room/model";
import {
  EYE_HEIGHT,
  navigationNodes,
} from "@/config/galleries/rounded-room/navigation";
import type {
  FloorNavigationTarget,
  NavigationNode,
  Vector3Tuple,
} from "@/features/navigation/navigation-types";
import { isWalkingSegmentClear } from "@/features/navigation/walkability";

interface GalleryModelProps {
  currentNode: NavigationNode;
  onFloorNavigate: (target: FloorNavigationTarget) => void;
}

const MAX_ANCHOR_DISTANCE = 7;
const MAX_TARGET_ANCHORS = 6;

function isWalkableSurface(object: Object3D | null) {
  let candidate = object;

  while (candidate) {
    if (candidate.name.startsWith("ground_") || candidate.name.startsWith("room_")) {
      return true;
    }

    candidate = candidate.parent;
  }

  return false;
}

function prepareMaterial(material: Material) {
  if (!(material instanceof MeshPhongMaterial)) {
    return;
  }

  material.shininess = Math.min(material.shininess, 8);
  material.side = DoubleSide;

  if (
    material.name.startsWith("ground_")
    || material.name.startsWith("room_")
  ) {
    material.color.set("#666662");
  } else if (material.name.startsWith("wall_")) {
    material.color.set("#d1d0ca");
  } else if (material.name === "white") {
    material.color.set("#b9b8b2");
  }
}

function distanceBetween(from: Vector3Tuple, to: Vector3Tuple) {
  return Math.hypot(to[0] - from[0], to[2] - from[2]);
}

export function GalleryModel({ currentNode, onFloorNavigate }: GalleryModelProps) {
  const materials = useLoader(MTLLoader, GALLERY_MODEL_MATERIAL_URL);
  const source = useLoader(OBJLoader, GALLERY_MODEL_OBJ_URL, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
  const model = useMemo(() => source.clone(true), [source]);
  const wallMeshes = useMemo(() => {
    const walls: Mesh[] = [];

    model.traverse((object) => {
      if (object instanceof Mesh && object.name.startsWith("wall_")) {
        walls.push(object);
      }
    });

    return walls;
  }, [model]);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      child.receiveShadow = true;
      const childMaterials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      childMaterials.forEach(prepareMaterial);
    });
  }, [model]);

  const handleFloorClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 6 || !isWalkableSurface(event.object)) {
      return;
    }

    event.stopPropagation();
    model.updateWorldMatrix(true, true);

    const position = [
      event.point.x,
      EYE_HEIGHT,
      event.point.z,
    ] as const satisfies Vector3Tuple;
    const anchorNodeIds = Object.values(navigationNodes)
      .map((node) => ({
        distance: distanceBetween(position, node.position),
        node,
      }))
      .filter(({ distance }) => distance <= MAX_ANCHOR_DISTANCE)
      .sort((left, right) => left.distance - right.distance)
      .filter(({ node }) => (
        isWalkingSegmentClear(position, node.position, wallMeshes)
      ))
      .slice(0, MAX_TARGET_ANCHORS)
      .map(({ node }) => node.id);

    onFloorNavigate({
      anchorNodeIds,
      directlyReachable: isWalkingSegmentClear(
        currentNode.position,
        position,
        wallMeshes,
      ),
      position,
    });
  };

  return (
    <primitive
      object={model}
      onClick={handleFloorClick}
      position={GALLERY_MODEL_POSITION}
      scale={GALLERY_MODEL_SCALE}
    />
  );
}

useLoader.preload(MTLLoader, GALLERY_MODEL_MATERIAL_URL);
