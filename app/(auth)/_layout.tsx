import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f9f9ff' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="select-role" />
      <Stack.Screen
        name="reset"
        options={{
          headerShown: true,
          headerTitle: "Recuperar contraseña",
          headerStyle: { backgroundColor: "#b3006a" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="update-password"
        options={{
          headerShown: true,
          headerTitle: "Nueva contraseña",
          headerStyle: { backgroundColor: "#b3006a" },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
