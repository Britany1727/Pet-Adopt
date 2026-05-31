import { Message, Room } from '../entities/Message';

export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  getRoomByMascota(mascotaId: string, clientId: string): Promise<Room | null>;
  createRoom(mascotaId: string, sellerId: string, clientId: string): Promise<Room>;
  getOrCreateGeneralRoom(userId: string): Promise<Room>;
  getOrCreateSellerRoom(sellerId: string, clientId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(roomId: string, userId: string, content: string, imageUrl?: string): Promise<Message>;
  uploadImage(uri: string, userId: string): Promise<string>;
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void;
}