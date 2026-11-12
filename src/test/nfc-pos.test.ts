import { describe, expect, it } from "vitest";
import { DEFAULT_RULES, cashbackFor, paymentToTranzactie, routeFor, spentFromBank } from "@/lib/nfc-pos";

describe("BestSaves NFC routing", () => {
  it("routes Carrefour to BT debit 2257 at 5%", () => {
    const r = routeFor(DEFAULT_RULES, "Carrefour", ["bt-debit", "bt-credit"]);
    expect(r?.cardId).toBe("bt-debit");
    expect(r?.percent).toBe(5);
  });
  it("routes OMV to BT Star at 3%", () => {
    expect(routeFor(DEFAULT_RULES, "OMV", ["bt-debit", "bt-credit"])).toMatchObject({ cardId: "bt-credit", percent: 3 });
  });
  it("240 RON at 5% earns 12 RON", () => expect(cashbackFor(240, 5)).toBe(12));
  it("falls back to first card when the chosen card was removed", () => {
    expect(routeFor(DEFAULT_RULES, "eMAG", ["bt-debit"])?.cardId).toBe("bt-debit");
  });
  it("payment becomes a spending transaction labelled as routed", () => {
    const t = paymentToTranzactie({ id: "1", merchant: "Carrefour", amount: 240, cardId: "bt-debit", cashback: 12, at: "2026-11-12T10:00:00Z" });
    expect(t.suma).toBe(-240);
    expect(t.descriere).toContain("Rutată via BestSaves NFC • +12,00 RON cashback");
  });
  it("subtracts payments only from the paying bank", () => {
    const p = [{ id: "1", merchant: "Carrefour", amount: 240, cardId: "bt-debit", cashback: 12, at: "" }];
    const bank = (id: string) => (id.startsWith("bt") ? "Banca Transilvania" : "ING");
    expect(spentFromBank(p, bank, "Banca Transilvania")).toBe(240);
    expect(spentFromBank(p, bank, "ING")).toBe(0);
  });
});
