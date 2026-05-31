import { IMapRepository } from '../../domain/repositories/IMapRepository';
import { SellerLocation } from '../../domain/entities/SellerLocation';
import { UserLocation } from '../../domain/entities/UserLocation';
import { supabase } from '@shared/infrastructure/supabase/client';

export class SupabaseMapRepository implements IMapRepository {
  async getSellerLocations(): Promise<SellerLocation[]> {
    // Obtenemos los perfiles tipo refugio que tengan coordenadas, adjuntando sus mascotas
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        avatar_url,
        role,
        latitude,
        longitude,
        mascotas (
          id,
          name,
          especie,
          image_url
        )
      `)
      .eq('role', 'refugio');

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.username,
      username: row.username,
      avatarUrl: row.avatar_url,
      role: row.role,
      latitude: row.latitude ? parseFloat(row.latitude) : 0,
      longitude: row.longitude ? parseFloat(row.longitude) : 0,
      mascotasAsociadas: (row.mascotas || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        especie: m.especie,
        imageUrl: m.image_url
      }))
    }));
  }

  async getUserLocation(userId: string): Promise<UserLocation | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, latitude, longitude')
      .eq('id', userId)
      .single();

    if (error) return null;
    if (!data || data.latitude == null || data.longitude == null) return null;

    return {
      id: data.id,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
  }

  async updateUserLocation(userId: string, latitude: number, longitude: number): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ latitude, longitude })
      .eq('id', userId);

    if (error) throw new Error(error.message);
  }
}