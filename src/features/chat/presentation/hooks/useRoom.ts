import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { CreateRoomUseCase } from "../../../../features/chat/application/usecases/CreateRoomUseCase";
import { Room } from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const chatRepo = new SupabaseChatRepository();
const createRoomUseCase = new CreateRoomUseCase(chatRepo);

export function useRooms() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => chatRepo.getRooms(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({ mascotaId, sellerId, clientId }: { mascotaId: string; sellerId: string; clientId: string }) =>
      createRoomUseCase.execute(mascotaId, sellerId, clientId),
    onSuccess: (newRoom) => {
      queryClient.setQueryData(["rooms"], (old: Room[]) => [
        newRoom,
        ...(old ?? []),
      ]);
    },
  });

  return {
    rooms,
    isLoading,
    error: error?.message ?? null,
    createRoom: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,
  };
}


