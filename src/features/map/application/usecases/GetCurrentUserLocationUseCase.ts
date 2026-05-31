import { IMapRepository } from '../../domain/repositories/IMapRepository';
import { UserLocation } from '../../domain/entities/UserLocation';

export class GetCurrentUserLocationUseCase {
  constructor(private mapRepository: IMapRepository) {}

  async execute(userId: string): Promise<UserLocation | null> {
    return await this.mapRepository.getUserLocation(userId);
  }
}
