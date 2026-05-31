-- ============================================================
-- CONFIGURACIÓN DE STORAGE PARA AVATARES
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================================

-- 1. Crear bucket chat-images si no existe (ya debería existir)
-- Si no existe, crearlo desde Supabase Dashboard > Storage > Create bucket
-- Nombre: chat-images
-- Público: true

-- 2. Políticas para storage.objects
-- Permitir a cualquier usuario autenticado ver imágenes
DROP POLICY IF EXISTS "chat_images_select" ON storage.objects;
CREATE POLICY "chat_images_select"
ON storage.objects FOR SELECT
USING (auth.role() = 'authenticated');

-- Permitir a cualquier usuario autenticado subir imágenes
DROP POLICY IF EXISTS "chat_images_insert" ON storage.objects;
CREATE POLICY "chat_images_insert"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Permitir a cada usuario actualizar sus propias imágenes
DROP POLICY IF EXISTS "chat_images_update" ON storage.objects;
CREATE POLICY "chat_images_update"
ON storage.objects FOR UPDATE
USING (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text);
