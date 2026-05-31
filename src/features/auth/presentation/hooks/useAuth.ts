import { GoogleSignInUseCase } from "@features/auth/aplication/usecases/GoogleSignInUseCase";
import { LoginUseCase } from "@features/auth/aplication/usecases/LoginUseCase";
import { RegisterUseCase } from "@features/auth/aplication/usecases/RegisterUseCase";
import { UpdateProfileUseCase } from "@features/auth/aplication/usecases/UpdateProfileUseCase";
import { UserRole, User } from "@features/auth/domain/entities/User";
import { ProfileData } from "@features/auth/domain/repositories/IAuthRepository";
import { SupabaseAuthRepository } from "@features/auth/infraestructure/repositories/SupabaseAuthRepository";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";

type RegisterDto = {
  email: string;
  password: string;
  username: string;
  role: UserRole;
};

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);
const googleSignInUseCase = new GoogleSignInUseCase(authRepo);
const updateProfileUseCase = new UpdateProfileUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, username, role }: RegisterDto) =>
      registerUseCase.execute(email, password, username, role),
    onSuccess: (user) => {
      setUser(user);
      router.replace('/(app)');
    },
  });

  const googleMutation = useMutation({
    mutationFn: () => googleSignInUseCase.execute(),
    onSuccess: (user) => {
      setUser(user);
      if (user.role === "pending") {
        router.replace("/(auth)/select-role" as any);
      } else {
        router.replace("/(app)");
      }
    },
  });

  const profileMutation = useMutation({
    mutationFn: ({ data }: { data: ProfileData }) =>
      updateProfileUseCase.execute(user!.id, data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });

  const logout = async () => {
    try {
      await authRepo.logout();
    } finally {
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  return {
    user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    loginWithGoogle: googleMutation.mutate,
    logout,
    updateProfile: profileMutation.mutate,
    isUpdatingProfile: profileMutation.isPending,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isGoogleLoading: googleMutation.isPending,
    error:
      loginMutation.error?.message ??
      registerMutation.error?.message ??
      googleMutation.error?.message ??
      profileMutation.error?.message ??
      null,
  };
}
