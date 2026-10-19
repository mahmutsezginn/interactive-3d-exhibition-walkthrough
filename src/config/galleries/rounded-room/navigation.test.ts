import { describe, expect, it } from "vitest";

import { navigationNodes } from "./navigation";

describe("rounded-room navigation graph", () => {
  it("only points to nodes that exist", () => {
    for (const node of Object.values(navigationNodes)) {
      for (const neighbor of node.neighbors) {
        expect(navigationNodes).toHaveProperty(neighbor);
      }
    }
  });

  it("uses bidirectional edges", () => {
    for (const node of Object.values(navigationNodes)) {
      for (const neighborId of node.neighbors) {
        const neighbor = navigationNodes[neighborId as keyof typeof navigationNodes];
        expect(neighbor.neighbors).toContain(node.id);
      }
    }
  });

  it("keeps every camera at the agreed eye height", () => {
    for (const node of Object.values(navigationNodes)) {
      expect(node.position[1]).toBe(1.65);
    }
  });
});
