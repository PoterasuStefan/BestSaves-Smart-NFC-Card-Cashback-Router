import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { posDeviceId, showPosNotification, type PosNotice } from "@/lib/pos-notifications";

/** Only new events for the validated account, with bounded polling as a reconnect fallback. */
export function PosNotificationBridge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    const since = new Date().toISOString();
    const device = posDeviceId();
    const seen = new Set<string>();
    let active = true;
    let fetching = false;
    const refresh = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const { data, error } = await supabase.from("pos_demo_events").select("id, device_id, merchant, card_id, card_bank, amount, percent").eq("user_id", user.id).gt("created_at", since).order("created_at", { ascending: true }).limit(100);
        if (error || !active) return;
        for (const row of data ?? []) {
          if (seen.has(row.id) || row.device_id === device || (row.merchant !== "Auchan" && row.merchant !== "Carrefour")) continue;
          seen.add(row.id);
          const event: PosNotice = { ...row, merchant: row.merchant };
          void showPosNotification(event, () => { void navigate({ to: "/dashboard" }); });
        }
      } finally { fetching = false; }
    };
    const channel = supabase.channel(`pos-${user.id}-${crypto.randomUUID()}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "pos_demo_events", filter: `user_id=eq.${user.id}` }, () => { void refresh(); }).subscribe();
    const timer = window.setInterval(() => { void refresh(); }, 3000);
    return () => { active = false; clearInterval(timer); void supabase.removeChannel(channel); };
  }, [user, navigate]);
  return null;
}