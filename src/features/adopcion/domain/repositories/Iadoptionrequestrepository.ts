import { AdoptionRequest, CreateAdoptionRequestDto, RequestStatus } from '../entities/Adoptionrequest'

export interface IAdoptionRequestRepository {
  /** Cliente: enviar solicitud para una mascota */
  sendRequest(dto: CreateAdoptionRequestDto & { clientId: string }): Promise<AdoptionRequest>;

  /** Cliente: obtener todas sus solicitudes enviadas */
  getMyRequests(clientId: string): Promise<AdoptionRequest[]>;

  /** Refugio: obtener solicitudes recibidas (con info del solicitante) */
  getIncomingRequests(sellerId: string): Promise<AdoptionRequest[]>;

  /** Refugio: aceptar o rechazar una solicitud */
  updateStatus(requestId: string, status: RequestStatus): Promise<AdoptionRequest>;

  /** Cliente: verificar si ya tiene solicitud activa para una mascota */
  getRequestByMascota(mascotaId: string, clientId: string): Promise<AdoptionRequest | null>;

  /** Cliente: cancelar una solicitud pending */
  cancelRequest(requestId: string): Promise<void>;
}