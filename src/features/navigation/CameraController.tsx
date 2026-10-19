"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  MathUtils,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from "three";

import { getPathWaypoints } from "@/config/galleries/rounded-room/navigation";
import type { NavigationNode } from "./navigation-types";

interface CameraControllerProps {
  currentNode: NavigationNode;
  targetNode: NavigationNode | null;
  reducedMotion: boolean;
  resetKey: number;
  viewOffset: number;
  onArrive: () => void;
}

interface MotionTransition {
  points: Vector3[];
  segmentLengths: number[];
  totalLength: number;
  startQuaternion: Quaternion;
  targetQuaternion: Quaternion;
  elapsed: number;
  duration: number;
}

interface ViewTransition {
  startQuaternion: Quaternion;
  targetQuaternion: Quaternion;
  elapsed: number;
  duration: number;
}

const UP = new Vector3(0, 1, 0);

function toVector3(value: readonly [number, number, number]) {
  return new Vector3(value[0], value[1], value[2]);
}

function orientationFor(node: NavigationNode, offsetDegrees = 0) {
  const position = toVector3(node.position);
  const direction = toVector3(node.lookAt).sub(position);
  direction.applyAxisAngle(UP, MathUtils.degToRad(offsetDegrees));

  const helper = new PerspectiveCamera();
  helper.position.copy(position);
  helper.lookAt(position.clone().add(direction));
  return helper.quaternion.clone();
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function samplePath(transition: MotionTransition, progress: number) {
  const distance = transition.totalLength * progress;
  let traversed = 0;

  for (let index = 0; index < transition.segmentLengths.length; index += 1) {
    const segmentLength = transition.segmentLengths[index];

    if (distance <= traversed + segmentLength || index === transition.segmentLengths.length - 1) {
      const localProgress = segmentLength === 0
        ? 1
        : (distance - traversed) / segmentLength;
      return new Vector3().lerpVectors(
        transition.points[index],
        transition.points[index + 1],
        MathUtils.clamp(localProgress, 0, 1),
      );
    }

    traversed += segmentLength;
  }

  return transition.points.at(-1)?.clone() ?? new Vector3();
}

export function CameraController({
  currentNode,
  targetNode,
  reducedMotion,
  resetKey,
  viewOffset,
  onArrive,
}: CameraControllerProps) {
  const { camera } = useThree();
  const motionTransition = useRef<MotionTransition | null>(null);
  const viewTransition = useRef<ViewTransition | null>(null);
  const onArriveRef = useRef(onArrive);

  useEffect(() => {
    onArriveRef.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    motionTransition.current = null;
    viewTransition.current = null;
    camera.position.copy(toVector3(currentNode.position));
    camera.quaternion.copy(orientationFor(currentNode));
  }, [camera, currentNode, resetKey]);

  useEffect(() => {
    if (!targetNode) {
      motionTransition.current = null;
      return;
    }

    const targetPosition = toVector3(targetNode.position);

    if (reducedMotion) {
      camera.position.copy(targetPosition);
      camera.quaternion.copy(orientationFor(targetNode));
      onArriveRef.current();
      return;
    }

    const points = [
      camera.position.clone(),
      ...getPathWaypoints(currentNode.id, targetNode.id).map(toVector3),
      targetPosition,
    ];
    const segmentLengths = points.slice(1).map((point, index) =>
      point.distanceTo(points[index]),
    );
    const totalLength = segmentLengths.reduce((total, length) => total + length, 0);

    viewTransition.current = null;
    motionTransition.current = {
      points,
      segmentLengths,
      totalLength,
      startQuaternion: camera.quaternion.clone(),
      targetQuaternion: orientationFor(targetNode),
      elapsed: 0,
      duration: MathUtils.clamp(totalLength / 3.6, 0.85, 3.2),
    };
  }, [camera, currentNode, reducedMotion, targetNode]);

  useEffect(() => {
    if (targetNode) {
      return;
    }

    const targetQuaternion = orientationFor(currentNode, viewOffset);

    if (reducedMotion) {
      camera.quaternion.copy(targetQuaternion);
      return;
    }

    viewTransition.current = {
      startQuaternion: camera.quaternion.clone(),
      targetQuaternion,
      elapsed: 0,
      duration: 0.4,
    };
  }, [camera, currentNode, reducedMotion, targetNode, viewOffset]);

  useFrame((_, delta) => {
    const movement = motionTransition.current;

    if (movement) {
      movement.elapsed += delta;
      const linearProgress = Math.min(movement.elapsed / movement.duration, 1);
      const progress = easeInOutCubic(linearProgress);

      camera.position.copy(samplePath(movement, progress));
      camera.quaternion.slerpQuaternions(
        movement.startQuaternion,
        movement.targetQuaternion,
        progress,
      );

      if (linearProgress === 1) {
        motionTransition.current = null;
        onArriveRef.current();
      }

      return;
    }

    const view = viewTransition.current;

    if (view) {
      view.elapsed += delta;
      const progress = easeInOutCubic(Math.min(view.elapsed / view.duration, 1));
      camera.quaternion.slerpQuaternions(
        view.startQuaternion,
        view.targetQuaternion,
        progress,
      );

      if (progress === 1) {
        viewTransition.current = null;
      }
    }
  });

  return null;
}
