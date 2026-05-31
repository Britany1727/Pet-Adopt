import { AdoptionRequest, RequestStatus } from '../../domain/entities/Adoptionrequest'
import { IAdoptionRequestRepository } from '../../domain/repositories/Iadoptionrequestrepository'

// ── Caso de uso: cliente consulta sus solicitudes enviadas ──────────────────
export class GetMyRequestsUseCase {
  constructor(private readonly repo: IAdoptionRequestRepository) {}

  execute(clientId: string): Promise<AdoptionRequest[]> {
    if (!clientId) throw new Error('Se requiere el ID del cliente');
    return this.repo.getMyRequests(clientId);
  }
}

// ── Caso de uso: refugio consulta solicitudes recibidas ─────────────────────
export class GetIncomingRequestsUseCase {
  constructor(private readonly repo: IAdoptionRequestRepository) {}

  execute(sellerId: string): Promise<AdoptionRequest[]> {
    if (!sellerId) throw new Error('Se requiere el ID del refugio');
    return this.repo.getIncomingRequests(sellerId);
  }
}

// ── Caso de uso: refugio acepta o rechaza una solicitud ─────────────────────
export class UpdateRequestStatusUseCase {
  constructor(private readonly repo: IAdoptionRequestRepository) {}

  async execute(requestId: string, status: RequestStatus): Promise<AdoptionRequest> {
    if (!requestId) throw new Error('Se requiere el ID de la solicitud');
    if (status === 'pending') throw new Error('No puedes poner el estado en pendiente manualmente');
    return this.repo.updateStatus(requestId, status);
  }
}

// ── Caso de uso: cliente cancela su solicitud ───────────────────────────────
export class CancelAdoptionRequestUseCase {
  constructor(private readonly repo: IAdoptionRequestRepository) {}

  async execute(requestId: string): Promise<void> {
    if (!requestId) throw new Error('Se requiere el ID de la solicitud');
    return this.repo.cancelRequest(requestId);
  }
}

// ── Caso de uso: verificar solicitud existente ──────────────────────────────
export class GetRequestByMascotaUseCase {
  constructor(private readonly repo: IAdoptionRequestRepository) {}

  execute(mascotaId: string, clientId: string): Promise<AdoptionRequest | null> {
    return this.repo.getRequestByMascota(mascotaId, clientId);
  }
}