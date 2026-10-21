"use client";

import { Canvas } from "@react-three/fiber";

import type {
  FloorNavigationTarget,
  NavigationNode,
} from "@/features/navigation/navigation-types";
import { GalleryScene } from "./GalleryScene";

interface ExhibitionCanvasProps {
  currentNode: NavigationNode;
  route: readonly NavigationNode[];
  reducedMotion: boolean;
  resetKey: number;
  onArrive: () => void;
  onFloorNavigate: (target: FloorNavigationTarget) => void;
  onModelError: (error: Error) => void;
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
      className={props.route.length > 0 ? "is-moving" : undefined}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      fallback={(
        <div className="canvas-error" role="alert">
          Bu tarayıcı WebGL sahnesini başlatamadı.
        </div>
      )}
      style={{ touchAction: "none" }}
    >
      <GalleryScene {...props} />
    </Canvas>
  );
}
