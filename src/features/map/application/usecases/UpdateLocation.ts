import { IMapRepository } from '../../domain/repositories/IMapRepository';

export class UpdateProductLocationUseCase {
  constructor(private mapRepository: IMapRepository) {}

  async execute(userId: string, latitude: number, longitude: number): Promise<void> {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Coordenadas geográficas inválidas.');
    }
    return await this.mapRepository.updateUserLocation(userId, latitude, longitude);
  }
}