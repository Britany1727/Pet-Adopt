// src/features/auth/aplication/usecases/GoogleSignInUseCase.ts
import { AuthError } from '../../../../shared/domain/errors/AppError';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class GoogleSignInUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<User> {
    try {
      return await this.authRepo.signInWithGoogle();
    } catch (error) {
      throw new AuthError('No se pudo iniciar sesión con Google', error);
    }
  }
}