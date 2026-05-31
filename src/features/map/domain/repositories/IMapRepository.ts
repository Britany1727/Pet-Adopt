import { SellerLocation } from '../entities/SellerLocation';
import { UserLocation } from '../entities/UserLocation';

export interface IMapRepository {
  getSellerLocations(): Promise<SellerLocation[]>;
  getUserLocation(userId: string): Promise<UserLocation | null>;
  updateUserLocation(userId: string, latitude: number, longitude: number): Promise<void>;
}