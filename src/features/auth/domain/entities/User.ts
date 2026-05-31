export type UserRole = 'refugio' | 'cliente' | 'pending';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: UserRole;
  fullName?: string;
  identificacion?: string;
  telefono?: string;
  ocupacion?: string;
  descripcionHogar?: string;
  direccionTexto?: string;
  latitude?: number;
  longitude?: number;
}
