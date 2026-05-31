import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseMascotasRepository } from "../../infrastructure/repositories/SupabaseMacotasRepository";
import { CreateMascotasUseCase } from "../../aplication/usecases/CreateMascotasUseCase";
import { DeleteMascotasUseCase } from "../../aplication/usecases/DeleteMascotasUseCase";

const mascotasRepo = new SupabaseMascotasRepository();
const createMascotaUseCase = new CreateMascotasUseCase(mascotasRepo);
const deleteMascotaUseCase = new DeleteMascotasUseCase(mascotasRepo);

export function useMascotas() {
  const queryClient = useQueryClient();

  const { data: mascotas = [], isLoading, error } = useQuery({
    queryKey: ["mascotas"],
    queryFn: () => mascotasRepo.getMascotas(),
  });

  const createMutation = useMutation({
    mutationFn: (params: {
      name: string;
      especie: string;
      edad: number;
      tamaño: string;
      descripcion: string;
      raza: string;
      sellerId: string;
      imageUrl?: string;
    }) => createMascotaUseCase.execute(
      params.name,
      params.especie,
      params.edad,
      params.tamaño,
      params.descripcion,
      params.raza,
      params.sellerId,
      params.imageUrl,
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascotas"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMascotaUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascotas"] });
    },
  });

  return {
    mascotas,
    isLoading,
    error,
    createMascota: createMutation.mutate,
    deleteMascota: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
