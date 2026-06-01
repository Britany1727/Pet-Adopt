import { User, UserRole } from '../entities/User';

export interface ProfileData {
  username?: string;
  fullName?: string;
  identificacion?: string;
  telefono?: string;
  ocupacion?: string;
  descripcionHogar?: string;
  direccionTexto?: string;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, username: string, role: UserRole): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  loginWithGoogle(): Promise<void>; 
  updateRole(userId: string, role: UserRole): Promise<User>;
  resetPasswordForEmail(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  updateProfile(userId: string, data: ProfileData): Promise<User>;
}