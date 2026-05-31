import { IMascotasRepository } from "../../domain/repositories/IMacotasRepository";

export class DeleteMascotasUseCase {
  constructor(private readonly mascotasRepo: IMascotasRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error("ID de mascota requerido");
    return this.mascotasRepo.deleteMascota(id);
  }
}
