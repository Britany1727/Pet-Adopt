import { AuthError } from '../../../../shared/domain/errors/AppError';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class ResetPasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) throw new AuthError('El correo es requerido');
    try {
      await this.authRepo.resetPasswordForEmail(email);
    } catch (error) {
      throw new AuthError('No se pudo enviar el correo de recuperación', error);
    }
  }
}
