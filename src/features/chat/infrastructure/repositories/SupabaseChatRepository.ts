import { supabase } from '@shared/infrastructure/supabase/client';
import { Message, Room } from '@features/chat/domain/entities/Message';
import { IChatRepository } from '@features/chat/domain/repositories/IChatRepository';

export class SupabaseChatRepository implements IChatRepository {

  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*, mascotas(name), client:profiles!rooms_client_id_fkey(username)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }

  async getRoomByMascota(mascotaId: string, clientId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*, mascotas(name), client:profiles!rooms_client_id_fkey(username)')
      .eq('mascota_id', mascotaId)
      .eq('client_id', clientId)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapRoom(data) : null;
  }

  async createRoom(mascotaId: string, sellerId: string, clientId: string): Promise<Room> {
    const data = await this.rpcCreateRoom({
      p_name: null,
      p_mascota_id: mascotaId,
      p_seller_id: sellerId,
      p_client_id: clientId,
    });
    return this.mapRoom(data);
  }

  async getOrCreateGeneralRoom(userId: string): Promise<Room> {
    const { data: existing } = await supabase
      .from('rooms')
      .select('*, mascotas(name), client:profiles!rooms_client_id_fkey(username)')
      .is('mascota_id', null)
      .eq('seller_id', userId)
      .eq('client_id', userId)
      .maybeSingle();
    if (existing) return this.mapRoom(existing);

    const data = await this.rpcCreateRoom({
      p_name: 'Soporte General',
      p_mascota_id: null,
      p_seller_id: userId,
      p_client_id: userId,
    });
    return this.mapRoom(data);
  }

  async getOrCreateSellerRoom(sellerId: string, clientId: string): Promise<Room> {
    const { data: existing } = await supabase
      .from('rooms')
      .select('*, mascotas(name), client:profiles!rooms_client_id_fkey(username)')
      .is('mascota_id', null)
      .eq('seller_id', sellerId)
      .eq('client_id', clientId)
      .maybeSingle();
    if (existing) return this.mapRoom(existing);

    const data = await this.rpcCreateRoom({
      p_name: 'Chat del Refugio',
      p_mascota_id: null,
      p_seller_id: sellerId,
      p_client_id: clientId,
    });
    return this.mapRoom(data);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, room_id, sender_id, user_id, content, image_url, created_at, profiles!messages_user_id_fkey(username)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(this.mapMessage);
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    imageUrl?: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      // ↓ incluye image_url en el insert y en el select de retorno
      .insert({ room_id: roomId, user_id: userId, sender_id: userId, content, image_url: imageUrl ?? null })
      .select('id, room_id, sender_id, user_id, content, image_url, created_at, profiles!messages_user_id_fkey(username)')
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }

  async uploadImage(uri: string, userId: string): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');

    const extMatch = uri.match(/\.(\w+)(?:\?\w+=.*)?$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      name: `image.${ext}`,
    } as any);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/chat-images/${fileName}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData as any,
      },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al subir imagen: ${text}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'messages', filter: `room_id=eq.${roomId}`,
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles').select('username')
          .eq('id', payload.new.user_id).single();
        onMessage({
          id:             payload.new.id,
          roomId:         payload.new.room_id,
          userId:         payload.new.user_id,
          content:        payload.new.content,
          imageUrl:       payload.new.image_url ?? undefined,
          createdAt:      new Date(payload.new.created_at),
          authorUsername: profile?.username,
        });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }

  private mapRoom = (raw: any): Room => ({
    id:          raw.id,
    mascotaId:   raw.mascota_id,
    mascotaName: raw.mascotas?.name,
    sellerId:    raw.seller_id,
    clientId:    raw.client_id,
    clientUsername: raw.client?.username,
    createdAt:   new Date(raw.created_at),
  });

  private async rpcCreateRoom(params: {
    p_name: string | null;
    p_mascota_id: string | null;
    p_seller_id: string;
    p_client_id: string;
  }): Promise<any> {
    const { data, error } = await supabase.rpc('create_room', params);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  }

  private mapMessage = (raw: any): Message => ({
    id:             raw.id,
    roomId:         raw.room_id,
    userId:         raw.user_id,
    content:        raw.content,
    imageUrl:       raw.image_url ?? undefined,
    createdAt:      new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });
}