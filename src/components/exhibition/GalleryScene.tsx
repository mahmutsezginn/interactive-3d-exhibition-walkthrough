"use client";

import { Suspense } from "react";

import type {
  FloorNavigationTarget,
  NavigationNode,
} from "@/features/navigation/navigation-types";
import { CameraController } from "@/features/navigation/CameraController";
import { NavigationHotspots } from "@/features/navigation/NavigationHotspots";
import { GalleryModel } from "./GalleryModel";
import { GalleryModelErrorBoundary } from "./GalleryModelErrorBoundary";

interface GallerySceneProps {
  currentNode: NavigationNode;
  route: readonly NavigationNode[];
  reducedMotion: boolean;
  resetKey: number;
  onArrive: () => void;
  onFloorNavigate: (target: FloorNavigationTarget) => void;
  onModelError: (error: Error) => void;
  onNavigate: (nodeId: string) => void;
}

export function GalleryScene({
  currentNode,
  route,
  reducedMotion,
  resetKey,
  onArrive,
  onFloorNavigate,
  onModelError,
  onNavigate,
}: GallerySceneProps) {
  return (
    <>
      <color attach="background" args={["#090a0b"]} />
      <fog attach="fog" args={["#090a0b", 48, 82]} />

      <hemisphereLight args={["#d9dde2", "#393632", 1.65]} />
      <directionalLight intensity={1.4} position={[8, 16, 5]} />
      <directionalLight intensity={0.55} position={[24, 8, -34]} />

      <GalleryModelErrorBoundary onError={onModelError}>
        <Suspense fallback={null}>
          <GalleryModel
            currentNode={currentNode}
            onFloorNavigate={onFloorNavigate}
          />
        </Suspense>
      </GalleryModelErrorBoundary>

      <NavigationHotspots
        currentNode={currentNode}
        disabled={route.length > 0}
        onNavigate={onNavigate}
        reducedMotion={reducedMotion}
      />

      <CameraController
        currentNode={currentNode}
        onArrive={onArrive}
        reducedMotion={reducedMotion}
        resetKey={resetKey}
        route={route}
      />
    </>
  );
}
