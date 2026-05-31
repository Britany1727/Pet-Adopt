export interface SellerLocation {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: 'refugio' | 'cliente';
  latitude: number;
  longitude: number;
  mascotasAsociadas?: {
    id: string;
    name: string;
    especie: string;
    imageUrl?: string;
  }[];
}