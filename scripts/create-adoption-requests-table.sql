CREATE TABLE IF NOT EXISTS public.adoption_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mascota_id  UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE CASCADE,
    client_id   UUID NOT NULL REFERENCES public.profiles(id),
    seller_id   UUID NOT NULL REFERENCES public.profiles(id),
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ar_select" ON public.adoption_requests;
DROP POLICY IF EXISTS "ar_insert" ON public.adoption_requests;
DROP POLICY IF EXISTS "ar_update" ON public.adoption_requests;

CREATE POLICY "ar_select" ON public.adoption_requests
    FOR SELECT USING (
        auth.role() = 'authenticated'
        AND (auth.uid() = client_id OR auth.uid() = seller_id)
    );

CREATE POLICY "ar_insert" ON public.adoption_requests
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() = client_id
    );

CREATE POLICY "ar_update" ON public.adoption_requests
    FOR UPDATE USING (
        auth.role() = 'authenticated'
        AND auth.uid() = seller_id
    );

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.adoption_requests;
