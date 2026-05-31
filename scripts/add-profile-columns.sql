-- Nuevas columnas para perfiles de cliente y refugio
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS identificacion TEXT,
  ADD COLUMN IF NOT EXISTS telefono TEXT,
  ADD COLUMN IF NOT EXISTS ocupacion TEXT,
  ADD COLUMN IF NOT EXISTS descripcion_hogar TEXT,
  ADD COLUMN IF NOT EXISTS direccion_texto TEXT;
