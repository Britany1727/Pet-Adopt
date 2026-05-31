import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import {
  CancelAdoptionRequestUseCase,
  GetIncomingRequestsUseCase,
  GetMyRequestsUseCase,
  GetRequestByMascotaUseCase,
  UpdateRequestStatusUseCase,
} from '../../application/usecases/Adoptionrequestusecases';
import { SendAdoptionRequestUseCase } from '../../application/usecases/Sendadoptionrequestusecase';
import { RequestStatus } from '../../domain/entities/Adoptionrequest';
import { SupabaseAdoptionRequestRepository } from '../../infrastructure/repositories/Supabaseadoprionrequestrepository';

// Instancias singleton (fuera del hook para no recrearlas en cada render)
const repo = new SupabaseAdoptionRequestRepository();
const sendUseCase           = new SendAdoptionRequestUseCase(repo);
const getMyUseCase          = new GetMyRequestsUseCase(repo);
const getIncomingUseCase    = new GetIncomingRequestsUseCase(repo);
const updateStatusUseCase   = new UpdateRequestStatusUseCase(repo);
const cancelUseCase         = new CancelAdoptionRequestUseCase(repo);
const getByMascotaUseCase   = new GetRequestByMascotaUseCase(repo);

// ── Hook: Para clientes — enviar y ver sus solicitudes ─────────────────────
export function useMyAdoptionRequests() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: myRequests = [], isLoading } = useQuery({
    queryKey: ['adoption_requests_mine', user?.id],
    queryFn: () => getMyUseCase.execute(user!.id),
    enabled: !!user && user.role === 'cliente',
  });

  const sendMutation = useMutation({
    mutationFn: (params: { mascotaId: string; sellerId: string; message?: string }) =>
      sendUseCase.execute({ ...params, clientId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoption_requests_mine'] });
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelUseCase.execute(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoption_requests_mine'] });
    },
    onError: (err: Error) => {
      Alert.alert('Error al cancelar', err.message);
    },
  });

  return {
    myRequests,
    isLoading,
    sendRequest: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    cancelRequest: cancelMutation.mutate,
    isCanceling: cancelMutation.isPending,
  };
}

// ── Hook: Para refugios — ver y gestionar solicitudes recibidas ─────────────
export function useIncomingAdoptionRequests() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: incomingRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['adoption_requests_incoming', user?.id],
    queryFn: () => getIncomingUseCase.execute(user!.id),
    enabled: !!user && user.role === 'refugio',
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      updateStatusUseCase.execute(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoption_requests_incoming'] });
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message);
    },
  });

  const pendingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  return {
    incomingRequests,
    isLoading,
    refetch,
    pendingCount,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}

// ── Hook: Verificar solicitud existente para una mascota específica ─────────
export function useRequestForMascota(mascotaId: string) {
  const user = useAuthStore((s) => s.user);

  const { data: existingRequest, isLoading, refetch } = useQuery({
    queryKey: ['adoption_request_check', mascotaId, user?.id],
    queryFn: () => getByMascotaUseCase.execute(mascotaId, user!.id),
    enabled: !!user && user.role === 'cliente' && !!mascotaId,
    staleTime: 10_000,
  });

  return { existingRequest: existingRequest ?? null, isLoading, refetch };
}