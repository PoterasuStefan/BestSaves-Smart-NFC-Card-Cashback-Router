import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, Bird, CheckCircle2, CreditCard, Loader2, Maximize2, Nfc, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bootstrapCards, useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/use-auth";
import { bestDemoRoute, type Retailer } from "@/lib/retailer-pos";
import { cashbackFor, recordPayment } from "@/lib/nfc-pos";
import { posDeviceId, publishPosNotification, showPosNotification, type PosNotice } from "@/lib/pos-notifications";
import { formatRON } from "@/lib/utils";

type Reader = { scan: (options: { signal: AbortSignal }) => Promise<void>; onreading: (() => void) | null };
export const RETAILER_POS_EVENT = "bestsaves:open-retailer-pos";

export function RetailerPos() {
  const [merchant, setMerchant] = useState<Retailer | null>(null);
  const [amount, setAmount] = useState("240");
  const [stage, setStage] = useState<"ready" | "routing" | "done">("ready");
  const [receipt, setReceipt] = useState<PosNotice | null>(null);
  const [nfcStatus, setNfcStatus] = useState("");
  const cards = useStore((s) => s.userCards);
  const { user } = useAuth();
  const navigate = useNavigate();
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const locked = useRef(false);
  const screen = useRef<HTMLDivElement | null>(null);
  const match = merchant ? bestDemoRoute(cards, merchant) : null;
  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0 && value <= 100000;

  const close = () => {
    clearTimeout(timer.current); controller.current?.abort(); locked.current = false;
    setMerchant(null);
    if (document.fullscreenElement) void document.exitFullscreen();
  };
  useEffect(() => {
    const open = (e: Event) => {
      const retailer = (e as CustomEvent<Retailer>).detail;
      if (retailer !== "Auchan" && retailer !== "Carrefour") return;
      clearTimeout(timer.current); controller.current?.abort(); bootstrapCards(); locked.current = false;
      setMerchant(retailer); setStage("ready"); setReceipt(null); setNfcStatus(""); setAmount("240");
    };
    window.addEventListener(RETAILER_POS_EVENT, open);
    return () => { window.removeEventListener(RETAILER_POS_EVENT, open); clearTimeout(timer.current); controller.current?.abort(); };
  }, []);

  const tap = () => {
    if (!merchant || !match || !valid || locked.current) return;
    locked.current = true; controller.current?.abort(); setStage("routing");
    const event: PosNotice = { id: crypto.randomUUID(), device_id: posDeviceId(), merchant, card_id: match.card.id, card_bank: match.card.bank, amount: value, percent: match.perk.percent };
    timer.current = setTimeout(() => {
      recordPayment({ id: event.id, merchant, cardId: event.card_id, amount: value, cashback: cashbackFor(value, event.percent), at: new Date().toISOString() });
      setReceipt(event); setStage("done");
      void showPosNotification(event, () => { close(); void navigate({ to: "/dashboard" }); });
      if (user) void publishPosNotification(event, user.id).catch(() => toast.error("Plata demo a reușit local, dar notificarea nu a ajuns la celelalte dispozitive."));
    }, 1800);
  };
  const tapRef = useRef(tap); tapRef.current = tap;
  const startNfc = async () => {
    const NdefReader = (window as unknown as { NDEFReader?: new () => Reader }).NDEFReader;
    if (!NdefReader) { setNfcStatus("NFC indisponibil aici. Folosește Simulează apropierea."); return; }
    try {
      controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
      const reader = new NdefReader();
      reader.onreading = () => tapRef.current();
      await reader.scan({ signal: abort.signal });
      setNfcStatus("Cititor activ. Apropie un tag NFC de demonstrație, nu un card bancar.");
    } catch { setNfcStatus("NFC oprit sau permisiune refuzată. Poți simula apropierea."); }
  };
  return <Dialog open={merchant !== null} onOpenChange={(open) => { if (!open) close(); }}>
    <DialogContent ref={screen} className={`retailer-pos ${merchant === "Auchan" ? "pos-auchan" : "pos-carrefour"} inset-0 h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 p-0 sm:rounded-none`}>
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-6 pb-6 pt-10">
        <header className="flex items-center justify-between gap-3 border-b border-current/15 pb-6">
          <div className="flex items-center gap-2 text-pos-brand">{merchant === "Auchan" ? <Bird className="size-9" /> : <ArrowLeftRight className="size-9" />}<DialogTitle className="font-display text-3xl">{merchant}</DialogTitle></div>
          <Button variant="ghost" size="icon" className="mr-8 text-pos-brand" aria-label="Ecran complet" title="Ecran complet" onClick={() => { if (screen.current?.requestFullscreen) void screen.current.requestFullscreen().catch(() => toast("Terminalul ocupă deja întregul ecran.")); }}><Maximize2 /></Button>
        </header>
        <DialogDescription className="mt-4 text-center text-xs text-pos-ink/70">Terminal POS · DEMO · fără tranzacții reale</DialogDescription>
        <div className="flex flex-1 flex-col justify-center py-8 text-center">
          <p className="text-sm text-pos-ink/65">{stage === "done" ? "Plată aprobată · demo" : "Total de plată"}</p>
          {stage === "ready" ? <label className="mt-2 block"><span className="sr-only">Sumă (RON)</span><Input aria-label="Sumă (RON)" type="number" inputMode="decimal" min="1" max="100000" value={amount} onChange={(e) => setAmount(e.target.value)} className="mx-auto h-20 max-w-64 border-0 bg-transparent text-center font-display text-5xl text-pos-ink shadow-none focus-visible:ring-pos-brand" /><span className="text-lg font-medium">RON</span></label> : <p className="mt-3 font-display text-4xl font-semibold">{formatRON(receipt?.amount ?? value)}</p>}
          <div className="relative mx-auto my-10 grid size-40 place-items-center">
            {stage === "ready" && <><span className="nfc-wave absolute size-32 rounded-full border-2 border-pos-brand/40" /><span className="absolute size-40 rounded-full border border-pos-brand/15" /></>}
            {stage === "done" ? <CheckCircle2 className="size-24 text-savings" /> : stage === "routing" ? <Loader2 className="size-20 animate-spin text-pos-brand" /> : <Nfc className="size-20 text-pos-brand" />}
          </div>
          <p role="status" className="font-display text-xl font-semibold">{stage === "done" ? "Mulțumim!" : stage === "routing" ? "Alegem beneficiul demo maxim…" : "Apropie cardul BestSaves"}</p>
          {receipt && <div className="mt-5 space-y-2 border-y border-pos-ink/15 py-5"><p className="font-medium">{receipt.card_bank}</p><p className="text-2xl font-semibold text-pos-brand">+{formatRON(cashbackFor(receipt.amount, receipt.percent))} 💸</p><p className="text-xs">{receipt.percent}% cashback simulat · maxim în portofelul demo</p></div>}
          {!match && <p className="mt-4 text-sm">Niciun card cu beneficiu demo pentru {merchant} în portofel.</p>}
        </div>
        <div className="space-y-3">
          {stage === "done" ? <Button className="h-12 w-full bg-pos-brand text-pos-paper hover:bg-pos-brand/90" onClick={() => { locked.current = false; setStage("ready"); setReceipt(null); }}><RotateCcw />Plată nouă</Button> : <>
            <Button className="h-12 w-full bg-pos-brand text-pos-paper hover:bg-pos-brand/90" disabled={stage !== "ready" || !match || !valid} onClick={tap}><CreditCard />Simulează apropierea</Button>
            <Button variant="outline" className="h-12 w-full border-pos-brand/30 bg-transparent text-pos-brand hover:bg-pos-brand/10 hover:text-pos-brand" disabled={stage !== "ready" || !match || !valid} onClick={startNfc}><Nfc />Activează NFC · tag demo</Button>
          </>}
          {nfcStatus && <p className="text-center text-xs">{nfcStatus}</p>}
          <p className="text-center text-xs text-pos-ink/65">{user ? "Notificări pe dispozitivele cu același cont și aplicația deschisă." : "Pentru notificare și pe calculator, intră în același cont pe ambele dispozitive."}</p>
          <p className="flex items-center justify-center gap-2 text-xs text-pos-ink/65"><ShieldCheck className="size-4 shrink-0" />Cashback fictiv. Nu citim datele cardului bancar.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}