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
      <Stack initialRouteName="index">
        {/* Tela Principal (Antigo Login) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Tela de Cadastro */}
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />

        {/* Tela de Esqueci a Senha */}
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />

        {/* Fluxo Principal de Abas (App Logado) */}
        <Stack.Screen name="main" options={{ headerShown: false }} />

        {/* Tela para rotas não encontradas */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}