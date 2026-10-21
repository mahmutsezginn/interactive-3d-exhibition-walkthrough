"use client";

import type { NavigationNode } from "@/features/navigation/navigation-types";

interface ExhibitionUIProps {
  currentNode: NavigationNode;
  moving: boolean;
  navigationNotice: string | null;
  reducedMotion: boolean;
  suggestedDestinations: readonly NavigationNode[];
  onNavigate: (nodeId: string) => void;
  onReducedMotionChange: (enabled: boolean) => void;
  onReturnToEntrance: () => void;
  onExit: () => void;
}

export function ExhibitionUI({
  currentNode,
  moving,
  navigationNotice,
  reducedMotion,
  suggestedDestinations,
  onNavigate,
  onReducedMotionChange,
  onReturnToEntrance,
  onExit,
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
          {moving
            ? "Seçtiğiniz noktaya güvenli rota üzerinden ilerleniyor."
            : navigationNotice
              ?? "Etrafa bakmak için yatay sürükleyin; ilerlemek için zemine tıklayın."}
        </span>
      </aside>

      <section className="navigation-panel" aria-label="Sergi navigasyonu">
        <p className="sr-only">
          Bakış yönünü değiştirmek için sol ve sağ ok tuşlarını kullanabilirsiniz.
          İlerlemek için aşağıdaki konum düğmelerinden birini seçin.
        </p>
        <div className="navigation-hint" aria-hidden="true">
          <span>Sürükle</span>
          <strong>360° bak</strong>
          <span>·</span>
          <span>Zemine tıkla</span>
          <strong>ilerle</strong>
        </div>

        <div className="destination-list" aria-label="Yakındaki önemli konumlar">
          {suggestedDestinations.map((destination) => (
            <button
              className="destination-button"
              disabled={moving}
              key={destination.id}
              onClick={() => onNavigate(destination.id)}
              type="button"
            >
              <span>{destination.shortLabel}</span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
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
