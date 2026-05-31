import { Mascotas } from "../entities/Mascotas";

export interface IMascotasRepository {
    getMascotas(): Promise<Mascotas[]>;
    getMascotaById(id: string): Promise<Mascotas>;
    createMascota(
        name: string,
        especie: string,
        edad: number,
        tamaño: string,
        descripcion: string,
        raza: string,
        sellerId: string,
        imageUrl?: string   
    ): Promise<Mascotas>;
    deleteMascota(id: string): Promise<void>;
}