// src/features/auth/infraestructure/repositories/SupabaseAuthRepository.ts
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserRole } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class SupabaseAuthRepository implements IAuthRepository {
  // ── métodos existentes sin cambio ──────────────────────────────────────────

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error;
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", data.user.id)
      .single();
    return {
      id: data.user.id,
      email: data.user.email!,
      username: profile?.username ?? "",
      avatarUrl: profile?.avatar_url ?? undefined,
      role: profile?.role ?? "cliente",
    };
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
      .select("username, avatar_url, role")
      .eq("id", user.id)
      .single();
    return {
      id: user.id,
      email: user.email!,
      username: profile?.username ?? "",
      avatarUrl: profile?.avatar_url ?? undefined,
      role: profile?.role ?? "cliente",
    };
  }

  // ── Google Sign-In ──────────────────────────────────────────────────────────

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

    // ← usar WebBrowser, NO AuthSession
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    if (result.type !== "success" || !result.url) {
      throw new Error("Login con Google cancelado");
    }

    // Extraer tokens del hash de la URL de callback
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
      .select("username, avatar_url, role")
      .eq("id", sessionData.user.id)
      .single();
    // ── Forzar role selection en Google Sign-In ──
    // El trigger de Supabase crea el perfil con role='cliente',
    // pero el usuario de Google aún no ha elegido rol.
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

    // Devolver el usuario actualizado
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", userId)
      .single();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      id: userId,
      email: user!.email!,
      username: profile?.username ?? "",
      avatarUrl: profile?.avatar_url ?? undefined,
      role: profile?.role ?? role,
    };
  }
}
