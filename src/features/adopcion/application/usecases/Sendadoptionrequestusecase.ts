import { AdoptionRequest } from '../../domain/entities/Adoptionrequest'
import { IAdoptionRequestRepository } from '../../domain/repositories/Iadoptionrequestrepository'

export class SendAdoptionRequestUseCase {
  constructor(private readonly repo: IAdoptionRequestRepository) {}

  async execute(params: {
    mascotaId: string;
    sellerId: string;
    clientId: string;
    message?: string;
  }): Promise<AdoptionRequest> {
    const { mascotaId, sellerId, clientId, message } = params;

    if (!mascotaId || !sellerId || !clientId) {
      throw new Error('Faltan datos para enviar la solicitud');
    }

    if (clientId === sellerId) {
      throw new Error('No puedes solicitar adoptar tu propia mascota');
    }

    // Verificar que no exista ya una solicitud para esta mascota
    const existing = await this.repo.getRequestByMascota(mascotaId, clientId);
    if (existing) {
      if (existing.status === 'pending') {
        throw new Error('Ya tienes una solicitud pendiente para esta mascota');
      }
      if (existing.status === 'accepted') {
        throw new Error('Tu solicitud ya fue aceptada');
      }
      // Si fue rechazada, se podría volver a solicitar en otro contexto,
      // por ahora informamos el estado anterior
      throw new Error('Ya enviaste una solicitud para esta mascota');
    }

    return this.repo.sendRequest({ mascotaId, sellerId, clientId, message });
  }
}