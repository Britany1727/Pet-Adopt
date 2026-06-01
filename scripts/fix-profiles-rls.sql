-- Habilitar RLS en profiles si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: cualquier autenticado puede leer perfiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para UPDATE: cada usuario solo puede modificar su propio perfil
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
