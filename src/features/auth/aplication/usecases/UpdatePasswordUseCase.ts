import { AuthError } from '../../../../shared/domain/errors/AppError';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class UpdatePasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6)
      throw new AuthError('La contraseña debe tener al menos 6 caracteres');
    try {
      await this.authRepo.updatePassword(newPassword);
    } catch (error) {
      throw new AuthError('No se pudo actualizar la contraseña', error);
    }
  }
}
