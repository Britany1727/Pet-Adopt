import { Mascotas } from "@features/mascotas/domain/entities/Mascotas";
import { IMascotasRepository } from "@features/mascotas/domain/repositories/IMacotasRepository";
import { supabase } from "@shared/infrastructure/supabase/client";

export class SupabaseMascotasRepository implements IMascotasRepository {
  async getMascotas(): Promise<Mascotas[]> {
    const { data, error } = await supabase
      .from("mascotas")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapMascota);
  }

  async getMascotaById(id: string): Promise<Mascotas> {
    const { data, error } = await supabase
      .from("mascotas")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return this.mapMascota(data);
  }

  async createMascota(
    name: string,
    especie: string,
    edad: number,
    tamaño: string,
    descripcion: string,
    raza: string,
    sellerId: string,
    imageUrl?: string,
  ): Promise<Mascotas> {
    const { data, error } = await supabase
      .from("mascotas")
      .insert({
        name,
        especie,
        edad,
        tamaño,
        descripcion,
        raza,
        seller_id: sellerId,
        image_url: imageUrl ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return this.mapMascota(data);
  }

  async deleteMascota(id: string): Promise<void> {
    const { error } = await supabase.from("mascotas").delete().eq("id", id);
    if (error) throw error;
  }

  private mapMascota = (raw: any): Mascotas => ({
    id: raw.id,
    name: raw.name,
    especie: raw.especie,
    edad: raw.edad,
    tamaño: raw.tamaño,
    descripcion: raw.descripcion,
    raza: raw.raza,
    imageUrl: raw.image_url ?? undefined,
    sellerId: raw.seller_id,
    sellerName: undefined,
    createdAt: new Date(raw.created_at),
  });
}