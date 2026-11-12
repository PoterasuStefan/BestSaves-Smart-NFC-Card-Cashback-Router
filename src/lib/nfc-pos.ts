import type { Tranzactie } from "./statement";

/** Prototip DEMO: cardul fizic BestSaves rutează plata către un card real. Totul rămâne în browser. */
export type RoutingRule = { merchant: string; cardId: string; percent: number; label: string };
export type PosPayment = { id: string; merchant: string; amount: number; cardId: string; cashback: number; at: string };

export const POS_MERCHANTS = ["Carrefour", "OMV", "eMAG", "Mega Image"] as const;
export const POS_AMOUNTS = [50, 150, 240, 500] as const;
export const SMART_CARD_ID = "#BS-NFC-01";

export const DEFAULT_RULES: RoutingRule[] = [
  { merchant: "Carrefour", cardId: "bt-debit", percent: 5, label: "Cashback" },
  { merchant: "OMV", cardId: "bt-credit", percent: 3, label: "Puncte Star" },
  { merchant: "eMAG", cardId: "ing-debit", percent: 3, label: "Cashback" },
  { merchant: "Mega Image", cardId: "bt-debit", percent: 2, label: "Cashback" },
];

const RULES_KEY = "bestsaves.nfcRules.v1";
const PAY_KEY = "bestsaves.nfcPayments.v1";
export const POS_EVENT = "bestsaves:pos-paid";

const read = <T,>(k: string, f: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? f; } catch { return f; } };
export const loadRules = () => read<RoutingRule[]>(RULES_KEY, DEFAULT_RULES);
export const saveRules = (r: RoutingRule[]) => localStorage.setItem(RULES_KEY, JSON.stringify(r));
export const loadPayments = () => read<PosPayment[]>(PAY_KEY, []);

/** Regula pentru comerciant; dacă cardul ales nu mai există, cade pe primul card disponibil. */
export function routeFor(rules: RoutingRule[], merchant: string, cardIds: string[]): RoutingRule | null {
  const r = rules.find((x) => x.merchant.toLowerCase() === merchant.toLowerCase());
  const fallback = cardIds[0];
  if (!r) return fallback ? { merchant, cardId: fallback, percent: 0, label: "Cashback" } : null;
  if (cardIds.includes(r.cardId)) return r;
  return fallback ? { ...r, cardId: fallback } : null;
}

export const cashbackFor = (amount: number, percent: number) => Math.round(amount * percent) / 100;

/** Plata din POS: tranzacție nouă în extras + scădere din banii curenți ai băncii cardului. */
export function paymentToTranzactie(p: PosPayment): Tranzactie {
  return {
    data: p.at.slice(0, 10), suma: -p.amount,
    categorie: p.merchant === "OMV" ? "transport" : p.merchant === "eMAG" ? "shopping" : "mancare",
    descriere: `${p.merchant} · Rutată via BestSaves NFC • +${p.cashback.toFixed(2).replace(".", ",")} RON cashback (demo)`,
  };
}

export function recordPayment(p: PosPayment) {
  localStorage.setItem(PAY_KEY, JSON.stringify([...loadPayments(), p]));
  window.dispatchEvent(new CustomEvent(POS_EVENT, { detail: p }));
}

/** Suma totală plătită prin POS din conturile unei bănci (pentru soldul demo). */
export const spentFromBank = (payments: PosPayment[], bankOf: (cardId: string) => string | undefined, bank: string) =>
  payments.filter((p) => bankOf(p.cardId) === bank).reduce((s, p) => s + p.amount, 0);
