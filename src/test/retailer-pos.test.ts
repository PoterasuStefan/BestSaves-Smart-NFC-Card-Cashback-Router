import { describe, expect, it } from "vitest";
import { DEFAULT_CARDS } from "@/lib/my-cards";
import { bestDemoRoute } from "@/lib/retailer-pos";
import { usePreferences } from "@/store/usePreferences";

describe("Retailer POS demo", () => {
  it("selects Raiffeisen at Auchan with simulated 5%", () => {
    expect(bestDemoRoute(DEFAULT_CARDS, "Auchan")).toMatchObject({ card: { id: "raiffeisen-cashback" }, perk: { percent: 5, status: "demo" } });
  });
  it("selects the maximum matching Carrefour demo perk", () => {
    const cards = [...DEFAULT_CARDS, { id: "higher", bank: "Test", name: "Demo", perks: [{ merchant: "Carrefour", percent: 8, status: "demo" as const }] }];
    expect(bestDemoRoute(cards, "Carrefour")?.card.id).toBe("higher");
  });
  it("never routes an unconfirmed benefit even if higher", () => {
    expect(bestDemoRoute([{ id: "x", bank: "Test", name: "Test", perks: [{ merchant: "Auchan", percent: 99 }] }], "Auchan")).toBeNull();
  });
  it("does not attach cashback from an absent card", () => {
    expect(bestDemoRoute(DEFAULT_CARDS.filter((c) => c.bank !== "Raiffeisen"), "Auchan")).toBeNull();
  });
  it("simplified mode is enabled by default and reversible", () => {
    expect(usePreferences.getState().simplified).toBe(true);
    usePreferences.getState().setSimplified(false);
    expect(usePreferences.getState().simplified).toBe(false);
    usePreferences.getState().setSimplified(true);
  });
});