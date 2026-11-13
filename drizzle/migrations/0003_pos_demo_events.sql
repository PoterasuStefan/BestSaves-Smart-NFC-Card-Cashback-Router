CREATE TABLE public.pos_demo_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, device_id uuid NOT NULL,
 merchant text NOT NULL CHECK (merchant IN ('Auchan','Carrefour')),
 card_id text NOT NULL CHECK (length(card_id) BETWEEN 1 AND 100), card_bank text NOT NULL CHECK (length(card_bank) BETWEEN 1 AND 100),
 amount numeric NOT NULL CHECK (amount > 0 AND amount <= 100000), percent numeric NOT NULL CHECK (percent >= 0 AND percent <= 100), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pos_demo_events TO authenticated;
GRANT ALL ON public.pos_demo_events TO service_role;
ALTER TABLE public.pos_demo_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own demo payments" ON public.pos_demo_events FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Send own demo payments" ON public.pos_demo_events FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE INDEX pos_demo_events_user_created ON public.pos_demo_events(user_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_demo_events;
COMMENT ON TABLE public.pos_demo_events IS 'Simulated POS notifications only; no payment credentials or personal statements.';