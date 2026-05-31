export type UserRole = 'refugio' | 'cliente' | 'pending';

export interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    role: UserRole;
}