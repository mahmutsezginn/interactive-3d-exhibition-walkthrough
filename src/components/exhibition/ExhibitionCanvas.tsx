"use client";

import { Canvas } from "@react-three/fiber";

import type { NavigationNode } from "@/features/navigation/navigation-types";
import { GalleryScene } from "./GalleryScene";

interface ExhibitionCanvasProps {
  currentNode: NavigationNode;
  targetNode: NavigationNode | null;
  reducedMotion: boolean;
  resetKey: number;
  viewOffset: number;
  onArrive: () => void;
  onNavigate: (nodeId: string) => void;
}

export function ExhibitionCanvas(props: ExhibitionCanvasProps) {
  return (
    <Canvas
      camera={{
        far: 120,
        fov: 62,
        near: 0.05,
        position: [0, 1.65, 0.65],
      }}
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <GalleryScene {...props} />
    </Canvas>
  );
}
