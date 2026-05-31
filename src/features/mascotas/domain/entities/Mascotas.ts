export interface Mascotas {
  id: string;
  name: string;
  especie: string;
  edad: number;
  tamaño: string;
  descripcion: string;
  raza: string;
  imageUrl?: string;
  sellerId: string;
  sellerName?: string;
  createdAt: Date;
}