"use client";

import { useProgress } from "@react-three/drei";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  findShortestNavigationPath,
  getNavigationNode,
  getSuggestedDestinations,
  navigationNodes,
} from "@/config/galleries/rounded-room/navigation";
import type {
  FloorNavigationTarget,
  NavigationNode,
  Vector3Tuple,
} from "@/features/navigation/navigation-types";
import { ExhibitionCanvas } from "./ExhibitionCanvas";
import { ExhibitionUI } from "./ExhibitionUI";

function useReducedMotionPreference() {
  const systemPreference = useSyncExternalStore(
    (onStoreChange) => {
      const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
      preference.addEventListener("change", onStoreChange);
      return () => preference.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [override, setOverride] = useState<boolean | null>(null);

  return [override ?? systemPreference, setOverride] as const;
}

function distanceBetween(from: Vector3Tuple, to: Vector3Tuple) {
  return Math.hypot(to[0] - from[0], to[2] - from[2]);
}

function routeLength(route: readonly string[]) {
  return route.slice(1).reduce((total, nodeId, index) => (
    total + distanceBetween(
      getNavigationNode(route[index]).position,
      getNavigationNode(nodeId).position,
    )
  ), 0);
}

function startAnchorIds(currentNode: NavigationNode) {
  return navigationNodes[currentNode.id]
    ? [currentNode.id]
    : [...currentNode.neighbors];
}

function planRouteToConfiguredNode(
  currentNode: NavigationNode,
  destinationId: string,
) {
  let bestRoute: NavigationNode[] = [];
  let bestLength = Number.POSITIVE_INFINITY;
  const currentIsConfigured = Boolean(navigationNodes[currentNode.id]);

  for (const startId of startAnchorIds(currentNode)) {
    const path = findShortestNavigationPath(startId, destinationId);

    if (path.length === 0) {
      continue;
    }

    const length = routeLength(path) + (
      currentIsConfigured
        ? 0
        : distanceBetween(currentNode.position, getNavigationNode(startId).position)
    );

    if (length < bestLength) {
      bestLength = length;
      bestRoute = (currentIsConfigured ? path.slice(1) : path).map(getNavigationNode);
    }
  }

  return bestRoute;
}

function planRouteToFloorTarget(
  currentNode: NavigationNode,
  floorNode: NavigationNode,
  directlyReachable: boolean,
) {
  if (directlyReachable) {
    return [floorNode];
  }

  let bestRoute: NavigationNode[] = [];
  let bestLength = Number.POSITIVE_INFINITY;
  const currentIsConfigured = Boolean(navigationNodes[currentNode.id]);

  for (const startId of startAnchorIds(currentNode)) {
    for (const endId of floorNode.neighbors) {
      const path = findShortestNavigationPath(startId, endId);

      if (path.length === 0) {
        continue;
      }

      const length = routeLength(path)
        + (currentIsConfigured
          ? 0
          : distanceBetween(currentNode.position, getNavigationNode(startId).position))
        + distanceBetween(getNavigationNode(endId).position, floorNode.position);

      if (length < bestLength) {
        bestLength = length;
        const graphRoute = currentIsConfigured ? path.slice(1) : path;
        bestRoute = [...graphRoute.map(getNavigationNode), floorNode];
      }
    }
  }

  return bestRoute;
}

export function ExhibitionExperience() {
  const [currentNode, setCurrentNode] = useState<NavigationNode>(() => (
    getNavigationNode("entrance")
  ));
  const [route, setRoute] = useState<NavigationNode[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [screenFade, setScreenFade] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [navigationNotice, setNavigationNotice] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useReducedMotionPreference();
  const floorTargetSequence = useRef(0);
  const { active, progress } = useProgress();

  const suggestedDestinations = useMemo(
    () => getSuggestedDestinations(
      navigationNodes[currentNode.id]
        ? currentNode.id
        : (currentNode.neighbors[0] ?? "entrance"),
    ),
    [currentNode],
  );
  const moving = route.length > 0;

  const navigate = useCallback((nodeId: string) => {
    if (route.length > 0 || nodeId === currentNode.id) {
      return;
    }

    const plannedRoute = planRouteToConfiguredNode(currentNode, nodeId);

    if (plannedRoute.length > 0) {
      setNavigationNotice(null);
      setRoute(plannedRoute);
    }
  }, [currentNode, route.length]);

  const navigateFromFloor = useCallback((target: FloorNavigationTarget) => {
    if (route.length > 0) {
      return;
    }

    floorTargetSequence.current += 1;
    const floorNode: NavigationNode = {
      id: `floor-target-${floorTargetSequence.current}`,
      kind: "waypoint",
      label: "Seçilen zemin noktası",
      shortLabel: "Serbest konum",
      position: target.position,
      lookAt: [target.position[0], target.position[1], target.position[2] - 1],
      neighbors: target.anchorNodeIds,
    };
    const plannedRoute = planRouteToFloorTarget(
      currentNode,
      floorNode,
      target.directlyReachable,
    );

    if (plannedRoute.length === 0) {
      setNavigationNotice("Bu noktaya güvenli bir yürüme bağlantısı bulunamadı.");
      return;
    }

    setNavigationNotice(null);
    setRoute(plannedRoute);
  }, [currentNode, route.length]);

  const handleArrive = useCallback(() => {
    const destination = route.at(-1);

    if (!destination) {
      return;
    }

    setCurrentNode(destination);
    setRoute([]);
  }, [route]);

  const handleModelError = useCallback((error: Error) => {
    setModelError(error.message);
  }, []);

  const returnToEntrance = useCallback(() => {
    setScreenFade(true);
    setRoute([]);
    setNavigationNotice(null);

    window.setTimeout(() => {
      setCurrentNode(getNavigationNode("entrance"));
      setResetKey((value) => value + 1);
    }, reducedMotion ? 0 : 180);

    window.setTimeout(() => {
      setScreenFade(false);
    }, reducedMotion ? 30 : 520);
  }, [reducedMotion]);

  const reenter = useCallback(() => {
    setHasExited(false);
    returnToEntrance();
  }, [returnToEntrance]);

  return (
    <main className="experience-shell">
      <div className="canvas-shell" aria-hidden={hasExited}>
        <ExhibitionCanvas
          currentNode={currentNode}
          onArrive={handleArrive}
          onFloorNavigate={navigateFromFloor}
          onModelError={handleModelError}
          onNavigate={navigate}
          reducedMotion={reducedMotion}
          resetKey={resetKey}
          route={route}
        />
      </div>

      <ExhibitionUI
        currentNode={currentNode}
        moving={moving}
        navigationNotice={navigationNotice}
        onExit={() => setHasExited(true)}
        onNavigate={navigate}
        onReducedMotionChange={setReducedMotion}
        onReturnToEntrance={returnToEntrance}
        reducedMotion={reducedMotion}
        suggestedDestinations={suggestedDestinations}
      />

      {active && (
        <div className="loading-screen" role="status">
          <span>Galeri hazırlanıyor</span>
          <strong>{Math.round(progress)}%</strong>
        </div>
      )}

      {modelError && (
        <div className="model-error" role="alert">
          <strong>3D model yüklenemedi.</strong>
          <span>{modelError}</span>
        </div>
      )}

      <div className={`screen-fade ${screenFade ? "is-visible" : ""}`} />

      {hasExited && (
        <div className="exit-screen" role="dialog" aria-modal="true">
          <p className="eyebrow">Ziyaret sona erdi</p>
          <h2>Sergiden çıktınız.</h2>
          <p>İstediğiniz zaman girişten yeniden başlayabilirsiniz.</p>
          <button onClick={reenter} type="button">
            Sergiye yeniden gir
          </button>
        </div>
      )}
    </main>
  );
}
