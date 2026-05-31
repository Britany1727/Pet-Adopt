import { User } from '../../domain/entities/User';
import { IAuthRepository, ProfileData } from '../../domain/repositories/IAuthRepository';

export class UpdateProfileUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(userId: string, data: ProfileData): Promise<User> {
    return this.authRepo.updateProfile(userId, data);
  }
}
