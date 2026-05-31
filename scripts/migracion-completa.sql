-- ============================================================
-- MIGRACIÓN COMPLETA: Tablas faltantes, RLS y Storage
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1. CREAR TABLA rooms (si no existe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT,
    mascota_id  UUID REFERENCES public.mascotas(id),
    seller_id   UUID REFERENCES public.profiles(id),
    client_id   UUID REFERENCES public.profiles(id),
    created_by  UUID,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CREAR TABLA messages (NUNCA FUE CREADA)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id),
    content     TEXT NOT NULL DEFAULT '',
    image_url   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. POLÍTICAS RLS PARA rooms
-- ============================================================
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update" ON public.rooms;

-- Cualquier usuario autenticado puede ver las salas donde participa
CREATE POLICY "rooms_select" ON public.rooms
    FOR SELECT USING (
        auth.role() = 'authenticated'
        AND (auth.uid() = seller_id OR auth.uid() = client_id)
    );

-- La función create_room (SECURITY DEFINER) se encarga del INSERT
CREATE POLICY "rooms_insert" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() = seller_id OR auth.uid() = client_id);

CREATE POLICY "rooms_update" ON public.rooms
    FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = client_id);

-- ============================================================
-- 4. POLÍTICAS RLS PARA messages
-- ============================================================
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;

-- Usuarios pueden ver mensajes de salas donde participan
CREATE POLICY "messages_select" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT seller_id FROM public.rooms WHERE id = room_id
            UNION
            SELECT client_id FROM public.rooms WHERE id = room_id
        )
    );

-- Usuarios pueden insertar mensajes en salas donde participan
CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IN (
            SELECT seller_id FROM public.rooms WHERE id = room_id
            UNION
            SELECT client_id FROM public.rooms WHERE id = room_id
        )
    );

-- ============================================================
-- 5. POLÍTICAS RLS PARA profiles (SELECT para joins)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. ASEGURAR QUE messages ESTÁ EN SUPABASE_REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.messages;

-- ============================================================
-- 7. CREAR BUCKET DE STORAGE PARA IMÁGENES
-- (Ejecutar en Supabase Dashboard -> Storage)
-- ============================================================
-- Esto se ejecuta con la API de Storage, NO como SQL directo.
-- Ve a: Supabase Dashboard -> Storage -> Create bucket
-- Nombre: chat-images
-- Público: true (necesario para que los usuarios puedan ver las imágenes)

-- ============================================================
-- 8. POLÍTICAS DE STORAGE PARA chat-images
-- (Ejecutar en Supabase Dashboard -> Storage -> Policies)
-- ============================================================
-- Política para SELECT (ver imágenes) - cualquier autenticado:
--   CREATE POLICY "chat_images_select"
--   ON storage.objects FOR SELECT USING (
--     auth.role() = 'authenticated'
--   );
--
-- Política para INSERT (subir imágenes) - cualquier autenticado:
--   CREATE POLICY "chat_images_insert"  
--   ON storage.objects FOR INSERT WITH CHECK (
--     auth.role() = 'authenticated'
--   );

-- ============================================================
-- 9. CORREGIR mapRoom PARA INCLUIR CLIENT USERNAME
-- ============================================================
-- En el archivo SupabaseChatRepository.ts, cambiar la query getRooms()
-- de: .select('*, mascotas(name)')
-- a:   .select('*, mascotas(name), profiles!rooms_client_id_fkey(username)')
