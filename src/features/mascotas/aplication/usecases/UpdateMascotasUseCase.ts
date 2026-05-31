import { Mascotas } from "../../domain/entities/Mascotas";
import { IMascotasRepository } from "../../domain/repositories/IMacotasRepository";

export class UpdateMascotasUseCase {
  constructor(private readonly mascotasRepo: IMascotasRepository) {}

  async execute(
    id: string,
    data: {
      name?: string;
      especie?: string;
      edad?: number;
      tamaño?: string;
      descripcion?: string;
      raza?: string;
      imageUrl?: string | null;
    },
  ): Promise<Mascotas> {
    if (!id) throw new Error("ID de mascota requerido");
    return this.mascotasRepo.updateMascota(id, data);
  }
}
