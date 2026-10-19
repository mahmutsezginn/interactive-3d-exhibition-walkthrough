"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";

import { getNavigationNode } from "@/config/galleries/rounded-room/navigation";
import type { NavigationNode } from "./navigation-types";

interface NavigationHotspotsProps {
  currentNode: NavigationNode;
  disabled: boolean;
  onNavigate: (nodeId: string) => void;
}

interface HotspotProps {
  node: NavigationNode;
  disabled: boolean;
  onNavigate: (nodeId: string) => void;
}

function Hotspot({ node, disabled, onNavigate }: HotspotProps) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
    group.current.scale.setScalar(pulse);
  });

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  return (
    <group
      ref={group}
      position={[node.position[0], 0.035, node.position[2]]}
      visible={!disabled}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.24, 48]} />
        <meshBasicMaterial
          color="#d9c9a3"
          depthWrite={false}
          opacity={0.72}
          transparent
        />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onNavigate(node.id);
        }}
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "";
        }}
        position={[0, 0.05, 0]}
      >
        <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>
    </group>
  );
}

export function NavigationHotspots({
  currentNode,
  disabled,
  onNavigate,
}: NavigationHotspotsProps) {
  return currentNode.neighbors.map((neighborId) => (
    <Hotspot
      disabled={disabled}
      key={neighborId}
      node={getNavigationNode(neighborId)}
      onNavigate={onNavigate}
    />
  ));
}
