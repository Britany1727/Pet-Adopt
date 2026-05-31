import { IMapRepository } from '../../domain/repositories/IMapRepository';
import { SellerLocation } from '../../domain/entities/SellerLocation';

export class GetProductLocationsUseCase {
  constructor(private mapRepository: IMapRepository) {}

  async execute(): Promise<SellerLocation[]> {
    const locations = await this.mapRepository.getSellerLocations();
    // Filtramos únicamente los que posean coordenadas válidas mapeadas
    return locations.filter(loc => loc.latitude !== null && loc.longitude !== null);
  }
}