import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { openHighlightedCard } from "./simulate-store";
import { formatRON } from "./utils";
import type { Retailer } from "./retailer-pos";

export type PosNotice = { id: string; device_id: string; merchant: Retailer; card_id: string; card_bank: string; amount: number; percent: number };
export function posDeviceId() {
  let id = sessionStorage.getItem("bestsaves.posDevice");
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("bestsaves.posDevice", id); }
  return id;
}
export async function enablePosNotifications() {
  const { Capacitor } = await import("@capacitor/core");
  if (Capacitor.isNativePlatform()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const result = await LocalNotifications.requestPermissions();
    toast(result.display === "granted" ? "Notificări activate" : "Permite notificările în setările telefonului.");
    return;
  }
  if (!("Notification" in window)) { toast("Acest browser nu acceptă notificări; mesajele apar în aplicație."); return; }
  if (window.top !== window.self) { toast("Deschide aplicația într-o filă separată pentru a permite notificările."); return; }
  const permission = await Notification.requestPermission();
  toast(permission === "granted" ? "Notificări activate" : "Permite notificările din setările browserului.");
}
export async function showPosNotification(event: PosNotice, open: () => void) {
  const title = `💳 ${event.merchant} · Plată DEMO aprobată`;
  const body = `${event.card_bank}: ${event.percent}% cashback simulat, maxim dintre beneficiile demo disponibile · +${formatRON(event.amount * event.percent / 100)} 💸`;
  const go = () => openHighlightedCard(event.card_id, open);
  toast(title, { description: body, duration: 15000, closeButton: true, action: { label: "Vezi cardul", onClick: go } });
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      if ((await LocalNotifications.checkPermissions()).display !== "granted") return;
      const listener = await LocalNotifications.addListener("localNotificationActionPerformed", (e) => {
        if (e.notification.extra?.posId === event.id) { go(); void listener.remove(); }
      });
      await LocalNotifications.schedule({ notifications: [{ id: Date.now() % 2147483647, title, body, extra: { posId: event.id } }] });
      return;
    }
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, { body });
      notification.onclick = () => { window.focus(); go(); notification.close(); };
    }
  } catch { /* Notification toast remains available if the OS rejects delivery. */ }
}
export async function publishPosNotification(event: PosNotice, userId: string) {
  const { error } = await supabase.from("pos_demo_events").insert({ ...event, user_id: userId });
  if (error) throw error;
}