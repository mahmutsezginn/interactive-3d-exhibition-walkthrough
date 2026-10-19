"use client";

import { useProgress } from "@react-three/drei";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import {
  getNavigationNode,
  type NavigationNodeId,
} from "@/config/galleries/rounded-room/navigation";
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

export function ExhibitionExperience() {
  const [currentNodeId, setCurrentNodeId] =
    useState<NavigationNodeId>("entrance");
  const [targetNodeId, setTargetNodeId] = useState<NavigationNodeId | null>(null);
  const [viewOffset, setViewOffset] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [screenFade, setScreenFade] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const [reducedMotion, setReducedMotion] = useReducedMotionPreference();
  const { active, progress } = useProgress();

  const currentNode = useMemo(
    () => getNavigationNode(currentNodeId),
    [currentNodeId],
  );
  const targetNode = useMemo(
    () => targetNodeId ? getNavigationNode(targetNodeId) : null,
    [targetNodeId],
  );

  const navigate = useCallback((nodeId: string) => {
    if (targetNodeId || !currentNode.neighbors.includes(nodeId)) {
      return;
    }

    setViewOffset(0);
    setTargetNodeId(nodeId as NavigationNodeId);
  }, [currentNode, targetNodeId]);

  const handleArrive = useCallback(() => {
    if (!targetNodeId) {
      return;
    }

    setCurrentNodeId(targetNodeId);
    setTargetNodeId(null);
    setViewOffset(0);
  }, [targetNodeId]);

  const returnToEntrance = useCallback(() => {
    setScreenFade(true);
    setTargetNodeId(null);

    window.setTimeout(() => {
      setCurrentNodeId("entrance");
      setViewOffset(0);
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
          onNavigate={navigate}
          reducedMotion={reducedMotion}
          resetKey={resetKey}
          targetNode={targetNode}
          viewOffset={viewOffset}
        />
      </div>

      <ExhibitionUI
        currentNode={currentNode}
        moving={Boolean(targetNode)}
        onExit={() => setHasExited(true)}
        onNavigate={navigate}
        onReducedMotionChange={setReducedMotion}
        onReturnToEntrance={returnToEntrance}
        onViewChange={setViewOffset}
        reducedMotion={reducedMotion}
        viewOffset={viewOffset}
      />

      {active && (
        <div className="loading-screen" role="status">
          <span>Galeri hazırlanıyor</span>
          <strong>{Math.round(progress)}%</strong>
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
