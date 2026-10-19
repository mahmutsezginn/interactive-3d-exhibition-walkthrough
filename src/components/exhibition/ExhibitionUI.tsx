"use client";

import { getNavigationNode } from "@/config/galleries/rounded-room/navigation";
import type { NavigationNode } from "@/features/navigation/navigation-types";

interface ExhibitionUIProps {
  currentNode: NavigationNode;
  moving: boolean;
  reducedMotion: boolean;
  viewOffset: number;
  onNavigate: (nodeId: string) => void;
  onReducedMotionChange: (enabled: boolean) => void;
  onReturnToEntrance: () => void;
  onExit: () => void;
  onViewChange: (offset: number) => void;
}

export function ExhibitionUI({
  currentNode,
  moving,
  reducedMotion,
  viewOffset,
  onNavigate,
  onReducedMotionChange,
  onReturnToEntrance,
  onExit,
  onViewChange,
}: ExhibitionUIProps) {
  return (
    <div className="interface-layer">
      <header className="exhibition-header">
        <div>
          <p className="eyebrow">Rounded Room · Prototype 01</p>
          <h1>Dijital Sergi</h1>
        </div>
        <div className="header-actions">
          <button
            className="text-button"
            disabled={moving || currentNode.id === "entrance"}
            onClick={onReturnToEntrance}
            type="button"
          >
            Girişe dön
          </button>
          <button className="text-button" onClick={onExit} type="button">
            Sergiden çık
          </button>
        </div>
      </header>

      <aside className="location-card" aria-live="polite">
        <span className="location-index">Konum</span>
        <strong>{moving ? "Hareket ediliyor…" : currentNode.label}</strong>
        <span className="location-note">
          Zemindeki halkayı veya aşağıdaki hedeflerden birini seç.
        </span>
      </aside>

      <section className="navigation-panel" aria-label="Sergi navigasyonu">
        <div className="view-controls" aria-label="Bakış yönü">
          <button
            aria-pressed={viewOffset === -42}
            disabled={moving}
            onClick={() => onViewChange(-42)}
            type="button"
          >
            Sola bak
          </button>
          <button
            aria-pressed={viewOffset === 0}
            disabled={moving}
            onClick={() => onViewChange(0)}
            type="button"
          >
            İleri bak
          </button>
          <button
            aria-pressed={viewOffset === 42}
            disabled={moving}
            onClick={() => onViewChange(42)}
            type="button"
          >
            Sağa bak
          </button>
        </div>

        <div className="destination-list" aria-label="Ulaşılabilir konumlar">
          {currentNode.neighbors.map((neighborId) => {
            const neighbor = getNavigationNode(neighborId);

            return (
              <button
                className="destination-button"
                disabled={moving}
                key={neighbor.id}
                onClick={() => onNavigate(neighbor.id)}
                type="button"
              >
                <span>{neighbor.shortLabel}</span>
                <span aria-hidden="true">↗</span>
              </button>
            );
          })}
        </div>

        <label className="motion-toggle">
          <input
            checked={reducedMotion}
            onChange={(event) => onReducedMotionChange(event.target.checked)}
            type="checkbox"
          />
          <span>Hareketi azalt</span>
        </label>
      </section>
    </div>
  );
}
