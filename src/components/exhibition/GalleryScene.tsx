"use client";

import { Suspense } from "react";

import type { NavigationNode } from "@/features/navigation/navigation-types";
import { CameraController } from "@/features/navigation/CameraController";
import { NavigationHotspots } from "@/features/navigation/NavigationHotspots";
import { GalleryModel } from "./GalleryModel";

interface GallerySceneProps {
  currentNode: NavigationNode;
  targetNode: NavigationNode | null;
  reducedMotion: boolean;
  resetKey: number;
  viewOffset: number;
  onArrive: () => void;
  onNavigate: (nodeId: string) => void;
}

export function GalleryScene({
  currentNode,
  targetNode,
  reducedMotion,
  resetKey,
  viewOffset,
  onArrive,
  onNavigate,
}: GallerySceneProps) {
  return (
    <>
      <color attach="background" args={["#090a0b"]} />
      <fog attach="fog" args={["#090a0b", 48, 82]} />

      <hemisphereLight args={["#d9dde2", "#393632", 1.65]} />
      <directionalLight intensity={1.4} position={[8, 16, 5]} />
      <directionalLight intensity={0.55} position={[24, 8, -34]} />

      <Suspense fallback={null}>
        <GalleryModel />
      </Suspense>

      <NavigationHotspots
        currentNode={currentNode}
        disabled={Boolean(targetNode)}
        onNavigate={onNavigate}
      />

      <CameraController
        currentNode={currentNode}
        onArrive={onArrive}
        reducedMotion={reducedMotion}
        resetKey={resetKey}
        targetNode={targetNode}
        viewOffset={viewOffset}
      />
    </>
  );
}
