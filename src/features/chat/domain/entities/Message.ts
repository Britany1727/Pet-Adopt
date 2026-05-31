export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  authorUsername?: string;
}

export interface Room {
  id: string;
  mascotaId?: string;
  mascotaName?: string;
  sellerId: string;
  clientId: string;
  clientUsername?: string;
  createdAt: Date;
}