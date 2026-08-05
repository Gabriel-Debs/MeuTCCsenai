import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
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

        {/* Tela para rotas não encontradas */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}