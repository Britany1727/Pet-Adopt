-- ============================================================
-- MIGRACIÓN: Esquema completo para Mascotas App (Refugio/Cliente)
-- ============================================================

-- 1. Agregar columna role a profiles (si no existe)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'cliente';

-- 2. Agregar columnas de ubicación a profiles (si no existen)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 3. Actualizar la función trigger para que guarde también el role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Actualizar perfiles existentes
UPDATE public.profiles SET role = COALESCE(
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE auth.users.id = profiles.id),
  'cliente'
) WHERE role IS NULL OR role = '';

-- 4. Crear tabla mascotas (reemplaza a products)
CREATE TABLE IF NOT EXISTS public.mascotas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    especie     TEXT NOT NULL DEFAULT '',
    edad        INTEGER NOT NULL DEFAULT 0,
    tamaño      TEXT NOT NULL DEFAULT '',
    descripcion TEXT,
    raza        TEXT NOT NULL DEFAULT '',
    image_url   TEXT,
    seller_id   UUID NOT NULL REFERENCES public.profiles(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mascotas_select" ON public.mascotas;
DROP POLICY IF EXISTS "mascotas_insert" ON public.mascotas;
DROP POLICY IF EXISTS "mascotas_update" ON public.mascotas;
DROP POLICY IF EXISTS "mascotas_delete" ON public.mascotas;

CREATE POLICY "mascotas_select" ON public.mascotas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "mascotas_insert" ON public.mascotas
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "mascotas_update" ON public.mascotas
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "mascotas_delete" ON public.mascotas
    FOR DELETE USING (auth.uid() = seller_id);

-- 5. Migrar rooms: agregar mascota_id
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS mascota_id UUID REFERENCES public.mascotas(id);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.rooms ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN created_by DROP NOT NULL;

-- Migrar datos desde product_id a mascota_id (si product_id existe y apunta a products)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'product_id') THEN
    UPDATE public.rooms SET mascota_id = product_id WHERE product_id IS NOT NULL;
  END IF;
END $$;

-- 6. Eliminar product_id de rooms (ya no lo usamos)
ALTER TABLE public.rooms DROP COLUMN IF EXISTS product_id;

-- 7. Verificar que supabase_realtime incluya messages
SELECT EXISTS (
  SELECT 1 FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
);

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.messages;

-- 8. Eliminar tabla products si existe (migración desde versión anterior)
DROP TABLE IF EXISTS public.products CASCADE;

-- 9. Función RPC para crear salas
CREATE OR REPLACE FUNCTION public.create_room(
  p_name TEXT DEFAULT NULL,
  p_mascota_id UUID DEFAULT NULL,
  p_seller_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL
)
RETURNS SETOF public.rooms
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.rooms (name, mascota_id, seller_id, client_id)
  VALUES (p_name, p_mascota_id, p_seller_id, p_client_id)
  RETURNING *;
END;
$$;
