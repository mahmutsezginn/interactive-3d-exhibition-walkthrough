"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import {
  Euler,
  MathUtils,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from "three";

import type { NavigationNode } from "./navigation-types";

interface CameraControllerProps {
  currentNode: NavigationNode;
  route: readonly NavigationNode[];
  reducedMotion: boolean;
  resetKey: number;
  onArrive: () => void;
}

interface MotionTransition {
  points: Vector3[];
  segmentLengths: number[];
  totalLength: number;
  lockedQuaternion: Quaternion;
  elapsed: number;
  duration: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startYaw: number;
}

const POINTER_SENSITIVITY = 0.004;

function toVector3(value: readonly [number, number, number]) {
  return new Vector3(value[0], value[1], value[2]);
}

function orientationFor(node: NavigationNode) {
  const position = toVector3(node.position);
  const lookAt = toVector3(node.lookAt);
  const helper = new PerspectiveCamera();
  helper.position.copy(position);
  helper.lookAt(lookAt.setY(position.y));
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
  route,
  reducedMotion,
  resetKey,
  onArrive,
}: CameraControllerProps) {
  const { camera, gl } = useThree();
  const motionTransition = useRef<MotionTransition | null>(null);
  const dragState = useRef<DragState | null>(null);
  const viewYaw = useRef(0);
  const currentNodeRef = useRef(currentNode);
  const onArriveRef = useRef(onArrive);
  const moving = route.length > 0;

  const syncViewYaw = useCallback(() => {
    const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
    viewYaw.current = euler.y;
  }, [camera]);

  const applyViewYaw = useCallback((yaw: number) => {
    viewYaw.current = yaw;
    camera.quaternion.setFromEuler(new Euler(0, yaw, 0, "YXZ"));
  }, [camera]);

  useEffect(() => {
    onArriveRef.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    currentNodeRef.current = currentNode;
  }, [currentNode]);

  useEffect(() => {
    const resetNode = currentNodeRef.current;

    motionTransition.current = null;
    camera.position.copy(toVector3(resetNode.position));
    camera.quaternion.copy(orientationFor(resetNode));
    syncViewYaw();
  }, [camera, resetKey, syncViewYaw]);

  useEffect(() => {
    if (route.length === 0) {
      motionTransition.current = null;
      return;
    }

    const destination = route.at(-1);

    if (!destination) {
      return;
    }

    if (reducedMotion) {
      camera.position.copy(toVector3(destination.position));
      onArriveRef.current();
      return;
    }

    const points = [camera.position.clone(), ...route.map((node) => toVector3(node.position))];
    const segmentLengths = points.slice(1).map((position, index) =>
      position.distanceTo(points[index]),
    );
    const totalLength = segmentLengths.reduce((total, length) => total + length, 0);

    motionTransition.current = {
      points,
      segmentLengths,
      totalLength,
      lockedQuaternion: camera.quaternion.clone(),
      elapsed: 0,
      duration: MathUtils.clamp(totalLength / 4.2, 0.65, 10),
    };
  }, [camera, reducedMotion, route]);

  useEffect(() => {
    const finishDrag = (event: PointerEvent) => {
      if (dragState.current?.pointerId !== event.pointerId) {
        return;
      }

      dragState.current = null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target !== gl.domElement
        || moving
        || (event.pointerType === "mouse" && event.button !== 0)
      ) {
        return;
      }

      dragState.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startYaw: viewYaw.current,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragState.current;

      if (!drag || drag.pointerId !== event.pointerId || moving) {
        return;
      }

      applyViewYaw(
        drag.startYaw - (event.clientX - drag.startX) * POINTER_SENSITIVITY,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (moving || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLInputElement) {
        return;
      }

      const yawStep = MathUtils.degToRad(7);

      if (event.key === "ArrowLeft") {
        applyViewYaw(viewYaw.current + yawStep);
      } else if (event.key === "ArrowRight") {
        applyViewYaw(viewYaw.current - yawStep);
      } else {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [applyViewYaw, gl, moving]);

  useFrame((_, delta) => {
    const movement = motionTransition.current;

    if (!movement) {
      return;
    }

    movement.elapsed += delta;
    const linearProgress = Math.min(movement.elapsed / movement.duration, 1);
    const progress = easeInOutCubic(linearProgress);
    const position = samplePath(movement, progress);

    camera.position.copy(position);
    camera.quaternion.copy(movement.lockedQuaternion);

    if (linearProgress === 1) {
      motionTransition.current = null;
      onArriveRef.current();
    }
  });

  return null;
}
