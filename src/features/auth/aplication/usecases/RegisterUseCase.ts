import { AuthError } from "../../../../shared/domain/errors/AppError";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { UserRole } from "../../domain/entities/User";

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string, username: string, role: UserRole): Promise<User> {
    if (!email || !password || !username || !role)
      throw new AuthError("Todos los campos son requeridos");
    if (password.length < 8)
      throw new AuthError("La contraseña debe tener al menos 8 caracteres");
    if (!/[A-Z]/.test(password))
      throw new AuthError("La contraseña debe contener al menos una mayúscula");
    if (!/[^a-zA-Z0-9\s]/.test(password))
      throw new AuthError("La contraseña debe contener al menos un símbolo especial");
    if (username.includes(' '))
      throw new AuthError("El nombre de usuario no puede contener espacios");
    try {
      return await this.authRepo.register(email, password, username, role);
    } catch (error) {
      const message = (error instanceof Error) ? error.message : "Error al registrar usuario";
      throw new AuthError(message, error);
    }
  }
}