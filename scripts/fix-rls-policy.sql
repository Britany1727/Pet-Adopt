-- ============================================================
-- FIX: Permitir SELECT en messages al remitente del mensaje
-- ============================================================

DROP POLICY IF EXISTS "messages_select" ON public.messages;

CREATE POLICY "messages_select" ON public.messages
    FOR SELECT USING (
        auth.role() = 'authenticated'
        AND (
            -- El remitente siempre puede ver su propio mensaje
            auth.uid() = user_id
            OR
            -- Los miembros de la sala (seller o client) ven todos los mensajes
            auth.uid() IN (
                SELECT seller_id FROM public.rooms WHERE id = room_id
                UNION
                SELECT client_id FROM public.rooms WHERE id = room_id
            )
        )
    );
