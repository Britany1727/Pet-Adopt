import { Mascotas } from "../../domain/entities/Mascotas";
import { IMascotasRepository } from "../../domain/repositories/IMacotasRepository";

export class CreateMascotasUseCase {
  constructor(private readonly mascotasRepo: IMascotasRepository) {}

  async execute(
    name: string,
    especie: string,
    edad: number,
    tamaño: string,
    descripcion: string,
    raza: string,
    sellerId: string,
    imageUrl?: string,
  ): Promise<Mascotas> {
    if (!name || !especie || !edad || !tamaño || !descripcion || !raza)
      throw new Error("Todos los campos son requeridos");
    return this.mascotasRepo.createMascota(
      name, especie, edad, tamaño, descripcion, raza, sellerId, imageUrl,
    );
  }
}
