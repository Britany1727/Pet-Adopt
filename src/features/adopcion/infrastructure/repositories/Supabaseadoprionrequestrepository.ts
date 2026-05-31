import { supabase } from '@shared/infrastructure/supabase/client';
import {
  AdoptionRequest,
  CreateAdoptionRequestDto,
  RequestStatus,
} from '../../domain/entities/Adoptionrequest'
import { IAdoptionRequestRepository } from '../../domain/repositories/Iadoptionrequestrepository'

const SELECT_FULL = `
  id,
  mascota_id,
  client_id,
  seller_id,
  status,
  message,
  created_at,
  updated_at,
  mascotas ( name, image_url, especie, raza, edad, descripcion, tamaño ),
  client_info:profiles!adoption_requests_client_id_fkey ( username, avatar_url, full_name, telefono ),
  seller_info:profiles!adoption_requests_seller_id_fkey ( username )
`;

export class SupabaseAdoptionRequestRepository implements IAdoptionRequestRepository {
  async sendRequest(
    dto: CreateAdoptionRequestDto & { clientId: string },
  ): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({
        mascota_id: dto.mascotaId,
        seller_id: dto.sellerId,
        client_id: dto.clientId,
        message: dto.message ?? null,
      })
      .select(SELECT_FULL)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async getMyRequests(clientId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select(SELECT_FULL)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(this.mapRow);
  }

  async getIncomingRequests(sellerId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select(SELECT_FULL)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(this.mapRow);
  }

  async updateStatus(requestId: string, status: RequestStatus): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .update({ status })
      .eq('id', requestId)
      .select(SELECT_FULL)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async getRequestByMascota(
    mascotaId: string,
    clientId: string,
  ): Promise<AdoptionRequest | null> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select(SELECT_FULL)
      .eq('mascota_id', mascotaId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapRow(data) : null;
  }

  async cancelRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('adoption_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw new Error(error.message);
  }

  // ── Mapper ────────────────────────────────────────────────────────────────
  private mapRow = (raw: any): AdoptionRequest => ({
    id: raw.id,
    mascotaId: raw.mascota_id,
    mascotaName: raw.mascotas?.name,
    mascotaImageUrl: raw.mascotas?.image_url ?? undefined,
    mascotaEspecie: raw.mascotas?.especie ?? undefined,
    mascotaRaza: raw.mascotas?.raza ?? undefined,
    mascotaEdad: raw.mascotas?.edad ?? undefined,
    mascotaDescripcion: raw.mascotas?.descripcion ?? undefined,
    mascotaTamaño: raw.mascotas?.tamaño ?? undefined,
    clientId: raw.client_id,
    clientUsername: raw.client_info?.username,
    clientAvatarUrl: raw.client_info?.avatar_url ?? undefined,
    clientFullName: raw.client_info?.full_name ?? undefined,
    clientTelefono: raw.client_info?.telefono ?? undefined,
    sellerId: raw.seller_id,
    sellerUsername: raw.seller_info?.username,
    status: raw.status as RequestStatus,
    message: raw.message ?? undefined,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  });
}