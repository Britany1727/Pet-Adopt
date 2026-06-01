import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserRole } from "../../domain/entities/User";
import {
  IAuthRepository,
  ProfileData,
} from "../../domain/repositories/IAuthRepository";

const PROFILE_SELECT = `
  username,
  avatar_url,
  role,
  full_name,
  identificacion,
  telefono,
  ocupacion,
  descripcion_hogar,
  direccion_texto,
  latitude,
  longitude
`;

function mapProfile(userId: string, email: string, profile: any): User {
  return {
    id: userId,
    email,
    username: profile?.username ?? "",
    avatarUrl: profile?.avatar_url ?? undefined,
    role: profile?.role ?? "cliente",
    fullName: profile?.full_name ?? undefined,
    identificacion: profile?.identificacion ?? undefined,
    telefono: profile?.telefono ?? undefined,
    ocupacion: profile?.ocupacion ?? undefined,
    descripcionHogar: profile?.descripcion_hogar ?? undefined,
    direccionTexto: profile?.direccion_texto ?? undefined,
    latitude: profile?.latitude ?? undefined,
    longitude: profile?.longitude ?? undefined,
  };
}

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error;
    const { data: profile } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", data.user.id)
      .single();
    return mapProfile(data.user.id, data.user.email!, profile);
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: UserRole,
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role },
        emailRedirectTo: `${process.env.EXPO_PUBLIC_WEB_URL}/confirm`,
      },
    });
    if (error) throw error;

    // Con "Confirm email" activo en Supabase no hay sesión hasta confirmar
    if (!data.session) {
      throw new Error(
        "Revisa tu correo y haz clic en el enlace de confirmación antes de iniciar sesión.",
      );
    }

    return {
      id: data.session.user.id,
      email: data.session.user.email!,
      username,
      role,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", user.id)
      .single();
    return mapProfile(user.id, user.email!, profile);
  }

  async loginWithGoogle(): Promise<void> {
    const redirectUrl = Linking.createURL("auth-callback");

    console.log("🔐 redirectUrl generado:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error("No se pudo obtener la URL de autorización");

    console.log("🔐 OAuth URL de Supabase:", data.url);

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (res.type !== "success") return;

    const resultUrl = (res as any).url as string;
    const qs = resultUrl.includes("?") ? resultUrl.split("?")[1] : "";
    const params = new URLSearchParams(qs);
    const code = params.get("code");

    if (!code) throw new Error("No se recibió el código de autorización");

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionError) throw sessionError;
  }
  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // El usuario cambia la contraseña en el navegador (Vercel)
      redirectTo: `${process.env.EXPO_PUBLIC_WEB_URL}/update-password`,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", userId)
      .single();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return mapProfile(userId, user!.email!, profile);
  }

  async updateProfile(userId: string, data: ProfileData): Promise<User> {
    const payload: Record<string, any> = {};

    if (data.username !== undefined) payload.username = data.username;
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.identificacion !== undefined)
      payload.identificacion = data.identificacion;
    if (data.telefono !== undefined) payload.telefono = data.telefono;
    if (data.ocupacion !== undefined) payload.ocupacion = data.ocupacion;
    if (data.descripcionHogar !== undefined)
      payload.descripcion_hogar = data.descripcionHogar;
    if (data.direccionTexto !== undefined)
      payload.direccion_texto = data.direccionTexto;
    if (data.latitude !== undefined) payload.latitude = data.latitude;
    if (data.longitude !== undefined) payload.longitude = data.longitude;
    if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);
    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", userId)
      .single();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return mapProfile(userId, user!.email!, profile);
  }
}
