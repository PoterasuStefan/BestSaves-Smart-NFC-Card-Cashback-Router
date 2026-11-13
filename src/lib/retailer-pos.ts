import { bestCardForStore, displayPerkStatus, type MyCard } from "./my-cards";

export const RETAILERS = ["Auchan", "Carrefour"] as const;
export type Retailer = (typeof RETAILERS)[number];
export function bestDemoRoute(cards: MyCard[], merchant: Retailer) {
  const normalized: MyCard[] = cards.map((card) => ({ ...card, perks: card.perks.map((perk) => ({ ...perk, status: displayPerkStatus(card, perk) === "demo" ? "demo" : "unverified" })) }));
  return bestCardForStore(normalized, merchant, { demo: true });
}