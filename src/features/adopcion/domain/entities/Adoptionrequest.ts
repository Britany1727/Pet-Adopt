export type RequestStatus = "pending" | "accepted" | "rejected";

export interface AdoptionRequest {
  id: string;
  mascotaId: string;
  mascotaName?: string;
  mascotaImageUrl?: string;
  mascotaEspecie?: string;
  mascotaRaza?: string;
  mascotaEdad?: number;
  mascotaDescripcion?: string;
  mascotaTamaño?: string;
  clientId: string;
  clientUsername?: string;
  clientAvatarUrl?: string;
  clientFullName?: string;
  clientTelefono?: string;
  sellerId: string;
  sellerUsername?: string;
  status: RequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdoptionRequestDto {
  mascotaId: string;
  sellerId: string;
  message?: string;
}
