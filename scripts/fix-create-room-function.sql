-- ============================================================
-- FIX: create_room ahora devuelve un solo objeto, no un array
-- ============================================================

DROP FUNCTION IF EXISTS public.create_room(text, uuid, uuid, uuid) CASCADE;

CREATE FUNCTION public.create_room(
  p_name TEXT DEFAULT NULL,
  p_mascota_id UUID DEFAULT NULL,
  p_seller_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL
)
RETURNS public.rooms
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result public.rooms;
BEGIN
  INSERT INTO public.rooms (name, mascota_id, seller_id, client_id)
  VALUES (p_name, p_mascota_id, p_seller_id, p_client_id)
  RETURNING * INTO result;
  RETURN result;
END;
$$;
