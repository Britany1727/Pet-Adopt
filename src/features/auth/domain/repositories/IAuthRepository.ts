import { User, UserRole } from '../entities/User';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, username: string, role: UserRole): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  signInWithGoogle(): Promise<User>; 
  updateRole(userId: string, role: UserRole): Promise<User>;
  resetPasswordForEmail(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}