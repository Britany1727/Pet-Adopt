import { AuthError } from '../../../../shared/domain/errors/AppError';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class UpdatePasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 8)
      throw new AuthError('La contraseña debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(newPassword))
      throw new AuthError('La contraseña debe contener al menos una mayúscula');
    if (!/[^a-zA-Z0-9\s]/.test(newPassword))
      throw new AuthError('La contraseña debe contener al menos un símbolo especial');
    try {
      await this.authRepo.updatePassword(newPassword);
    } catch (error) {
      throw new AuthError('No se pudo actualizar la contraseña', error);
    }
  }
}
