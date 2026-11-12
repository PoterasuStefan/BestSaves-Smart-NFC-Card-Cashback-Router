import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Nfc, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { HIGHLIGHT_KEY } from "@/lib/simulate-store";
import { loadStatement, saveStatement } from "@/lib/statement";
import { POS_AMOUNTS, POS_MERCHANTS, SMART_CARD_ID, cashbackFor, loadRules, paymentToTranzactie, recordPayment, routeFor, type PosPayment } from "@/lib/nfc-pos";
import { formatRON } from "@/lib/utils";

type NdefReader = { scan: (o?: { signal?: AbortSignal }) => Promise<void>; onreading: ((e: { serialNumber?: string }) => void) | null; onreadingerror: (() => void) | null };

export type PosInit = { merchant?: string; amount?: number; autoTap?: boolean };

export function PosTerminal({ open, onOpenChange, init }: { open: boolean; onOpenChange: (v: boolean) => void; init?: PosInit | undefined }) {
  const cards = useStore((s) => s.userCards);
  const [merchant, setMerchant] = useState("Carrefour");
  const [amount, setAmount] = useState(240);
  const [step, setStep] = useState(0);
  const [tagId, setTagId] = useState(SMART_CARD_ID);
  const [done, setDone] = useState<PosPayment | null>(null);
  const [nfcMsg, setNfcMsg] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const nfcAbort = useRef<AbortController | null>(null);

  const route = routeFor(loadRules(), merchant, cards.map((c) => c.id));
  const card = cards.find((c) => c.id === route?.cardId);

  const reset = () => { timers.current.forEach(clearTimeout); timers.current = []; setStep(0); setDone(null); };

  const tap = (id = SMART_CARD_ID) => {
    if (!route || !card || step > 0) return;
    reset(); setTagId(id); setStep(1);
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(500, () => setStep(2));
    at(1100, () => setStep(3));
    at(1700, () => {
      const p: PosPayment = { id: crypto.randomUUID(), merchant, amount, cardId: card.id, cashback: cashbackFor(amount, route.percent), at: new Date().toISOString() };
      const st = loadStatement();
      if (st) { const last = st.map((t) => t.data).sort().at(-1); saveStatement([...st, { ...paymentToTranzactie(p), ...(last ? { data: last } : {}) }]); }
      recordPayment(p);
      sessionStorage.setItem(HIGHLIGHT_KEY, card.id);
      window.dispatchEvent(new Event("bestsaves:highlight"));
      setDone(p); setStep(4);
    });
  };
  const tapRef = useRef(tap); tapRef.current = tap;

  useEffect(() => {
    if (!open) { reset(); nfcAbort.current?.abort(); return; }
    if (init?.merchant) setMerchant(init.merchant);
    if (init?.amount && init.amount > 0) setAmount(init.amount);
    if (init?.autoTap) { const t = window.setTimeout(() => tapRef.current(), 400); return () => clearTimeout(t); }
    return undefined;
  }, [open, init]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); nfcAbort.current?.abort(); }, []);

  const startNfc = async () => {
    const Reader = (window as unknown as { NDEFReader?: new () => NdefReader }).NDEFReader;
    if (!Reader) { setNfcMsg("Browserul nu suportă Web NFC (merge în Chrome pe Android). Folosește butonul de simulare."); return; }
    try {
      nfcAbort.current?.abort();
      const ctrl = new AbortController(); nfcAbort.current = ctrl;
      const r = new Reader();
      r.onreading = (e) => tapRef.current(e.serialNumber ? `#${e.serialNumber}` : SMART_CARD_ID);
      r.onreadingerror = () => setNfcMsg("Nu am putut citi tag-ul. Mai apropie o dată cardul.");
      await r.scan({ signal: ctrl.signal });
      setNfcMsg("Cititor NFC activ — apropie cardul fizic de telefon.");
    } catch { setNfcMsg("Permisiunea NFC a fost refuzată sau NFC e oprit pe telefon."); }
  };

  const busy = step > 0 && step < 4;
  const steps = [
    `📡 Card fizic BestSaves detectat (ID: ${tagId})...`,
    `🧠 Comerciant detectat: ${merchant} • Căutare beneficiu maxim...`,
    card && route ? `🔀 Rutare automată către: ${card.bank} (•••• ${card.last4 ?? "0000"}) — ${route.percent}% ${route.label} activat` : "",
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) onOpenChange(v); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terminal POS · demo</DialogTitle>
          <DialogDescription>Simulare de plată în magazin. Cashback-ul este demo, nu o ofertă bancară confirmată.</DialogDescription>
        </DialogHeader>

        {step === 4 && done && card ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-primary p-5 text-center text-primary-foreground">
              <CheckCircle2 className="mx-auto size-10" />
              <div className="mt-2 font-display text-xl font-semibold">✅ Plată Aprobată: {formatRON(done.amount)}</div>
            </div>
            <dl className="space-y-2 rounded-xl border p-4 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Card fizic folosit</dt><dd className="font-medium">BestSaves Smart Card</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Card debitat real</dt><dd className="font-medium">{card.bank} (•••• {card.last4})</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Cashback câștigat automat</dt><dd className="font-semibold text-primary">+{formatRON(done.cashback)} <span className="text-[10px] font-normal text-muted-foreground">demo</span></dd></div>
            </dl>
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={reset}>Plată nouă</Button><Button className="flex-1" onClick={() => onOpenChange(false)}>Închide</Button></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Comerciant</div>
              <div className="flex flex-wrap gap-1.5">
                {POS_MERCHANTS.map((m) => <Button key={m} size="sm" disabled={busy} variant={m === merchant ? "default" : "outline"} onClick={() => setMerchant(m)}>{m}</Button>)}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Sumă de plată (RON)</div>
              <Input type="number" min={1} inputMode="decimal" value={amount} disabled={busy} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POS_AMOUNTS.map((a) => <Button key={a} size="sm" disabled={busy} variant={a === amount ? "secondary" : "ghost"} onClick={() => setAmount(a)}>{a} RON</Button>)}
              </div>
            </div>

            <button type="button" onClick={() => tap()} disabled={busy || !card || amount <= 0}
              className="relative grid h-40 w-full place-items-center overflow-hidden rounded-2xl border border-primary/40 bg-primary/5 text-sm">
              {!busy && [0, 0.6, 1.2].map((d) => <span key={d} className="nfc-wave absolute size-24 rounded-full border-2 border-primary/60" style={{ animationDelay: `${d}s` }} />)}
              <span className="relative flex flex-col items-center gap-1 font-medium"><Nfc className="size-8 text-primary" />Apropie Cardul Fizic BestSaves (NFC)</span>
            </button>

            {step > 0 && (
              <ol className="space-y-1.5 rounded-xl border bg-muted/40 p-3 font-mono text-xs">
                {steps.slice(0, step).map((s) => <li key={s} className="animate-in fade-in slide-in-from-left-2">{s}</li>)}
              </ol>
            )}
            {!card && <p className="text-xs text-destructive">Adaugă un card ca să poți ruta plata.</p>}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" disabled={busy} onClick={startNfc}><Nfc className="size-4" /> Activează Cititor NFC Telefon</Button>
              <Button disabled={busy || !card || amount <= 0} onClick={() => tap()}><Zap className="size-4" /> Simulează Tap Card Fizic</Button>
            </div>
            {nfcMsg && <p className="text-xs text-muted-foreground">{nfcMsg}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
