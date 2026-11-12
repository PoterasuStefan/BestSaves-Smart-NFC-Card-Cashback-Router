import { useEffect, useState } from "react";
import { ChevronDown, Nfc } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_RULES, loadRules, saveRules, type RoutingRule } from "@/lib/nfc-pos";
import type { MyCard } from "@/lib/my-cards";

/** Cardul master afișat primul în carousel. */
export function SmartCardFace() {
  return (
    <div className="wallet-smart relative flex h-36 w-60 flex-col justify-between rounded-2xl p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div><div className="text-sm font-semibold">BestSaves Smart Card</div><div className="text-[10px] opacity-75">Proxy NFC · demo</div></div>
        <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground"><Nfc className="size-3" />NFC Ready</span>
      </div>
      <div className="h-6 w-9 rounded-md bg-wallet-foreground/30" />
      <div className="flex items-end justify-between text-xs">
        <span className="inline-flex items-center gap-1.5"><span className="size-1.5 animate-pulse rounded-full bg-primary" />Auto-Routing Activ</span>
        <span className="font-mono tracking-wider opacity-90">•••• 0001</span>
      </div>
    </div>
  );
}

export function SmartRoutingRules({ cards }: { cards: MyCard[] }) {
  const [rules, setRules] = useState<RoutingRule[]>(DEFAULT_RULES);
  useEffect(() => { setRules(loadRules()); }, []);
  const change = (merchant: string, cardId: string) => {
    const next = rules.map((r) => (r.merchant === merchant ? { ...r, cardId } : r));
    setRules(next); saveRules(next);
  };
  return (
    <Collapsible className="rounded-xl border bg-card/60">
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium">
        Reguli Smart Routing (Demo)
        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-4 pb-4">
        <p className="text-xs text-muted-foreground">Cardul fizic BestSaves trimite automat plata către cardul ales pentru fiecare magazin. Procentele sunt simulate.</p>
        {rules.map((r) => (
          <div key={r.merchant} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-24 font-medium">{r.merchant}</span>
            <span className="text-muted-foreground">→</span>
            <Select value={cards.some((c) => c.id === r.cardId) ? r.cardId : undefined} onValueChange={(v) => change(r.merchant, v)}>
              <SelectTrigger className="h-8 w-60"><SelectValue placeholder="Alege cardul" /></SelectTrigger>
              <SelectContent>
                {cards.map((c) => <SelectItem key={c.id} value={c.id}>{c.bank} {c.name} (•••• {c.last4 ?? "0000"})</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary">{r.percent}% {r.label}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
