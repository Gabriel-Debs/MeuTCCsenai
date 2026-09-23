import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

// Impede que a tela de splash suma antes de carregar os recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Esconde a tela de carregamento inicial assim que o layout for montado
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
        },
      }}
      initialRouteName="index"
    >
      {/* Tela Principal (Login) */}
      <Stack.Screen name="index" />

      {/* Tela Principal do App Logado */}
      <Stack.Screen name="main" />

      {/* Tela de Cadastro */}
      <Stack.Screen name="cadastro" />

      {/* Tela de Solicitação de Recuperação de Senha */}
      <Stack.Screen name="forgot-password" />

      {/* Tela de Redefinição de Senha (link enviado por e-mail) */}
      <Stack.Screen name="reset-password" />

    </Stack>
  );
}