import { AuthError } from '../../../../shared/domain/errors/AppError';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class LoginWithGoogleUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<void> {
    try {
      return await this.authRepo.loginWithGoogle();
    } catch (error) {
      throw new AuthError('No se pudo iniciar sesión con Google', error);
    }
  }
}
