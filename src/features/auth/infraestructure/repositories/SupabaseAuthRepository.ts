import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserRole } from "../../domain/entities/User";
import { IAuthRepository, ProfileData } from "../../domain/repositories/IAuthRepository";

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
      options: { data: { username, role } },
    });
    if (error) throw error;

    if (data.session) {
      const user = data.session.user;
      return { id: user.id, email: user.email!, username, role };
    }

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw loginError;

    return {
      id: loginData.user.id,
      email: loginData.user.email!,
      username, role,
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

  async signInWithGoogle(): Promise<User> {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: "michatapp" });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data?.url)
      throw new Error(error?.message ?? "No se obtuvo la URL de Google");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    if (result.type !== "success" || !result.url) {
      throw new Error("Login con Google cancelado");
    }

    const url = new URL(result.url);
    const params = new URLSearchParams(url.hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") ?? "";

    if (!accessToken) throw new Error("No se recibió el token de Google");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    if (sessionError || !sessionData.user) throw sessionError;

    const { data: profile } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", sessionData.user.id)
      .single();

    const currentRole: UserRole = profile?.role ?? "pending";
    if (currentRole === "cliente") {
      await supabase.from("profiles").update({ role: "pending" }).eq("id", sessionData.user.id);
    }

    return {
      id: sessionData.user.id,
      email: sessionData.user.email!,
      username:
        profile?.username ??
        sessionData.user.user_metadata?.full_name ??
        sessionData.user.email!.split("@")[0],
      avatarUrl:
        profile?.avatar_url ??
        sessionData.user.user_metadata?.avatar_url ??
        undefined,
      role: currentRole === "cliente" ? "pending" : currentRole,
    };
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'petadoptapp://(auth)/update-password',
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
    if (data.identificacion !== undefined) payload.identificacion = data.identificacion;
    if (data.telefono !== undefined) payload.telefono = data.telefono;
    if (data.ocupacion !== undefined) payload.ocupacion = data.ocupacion;
    if (data.descripcionHogar !== undefined) payload.descripcion_hogar = data.descripcionHogar;
    if (data.direccionTexto !== undefined) payload.direccion_texto = data.direccionTexto;
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
