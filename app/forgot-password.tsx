import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Importação do client do Supabase
import { supabase } from '../lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper para alertas em Web e Mobile
  const showAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      if (onPress) onPress();
    } else {
      Alert.alert(
        title,
        message,
        onPress ? [{ text: 'OK', onPress }] : undefined
      );
    }
  };

  const handleResetPassword = async () => {
    // 1. Validações básicas[cite: 5]
    if (!email.trim()) {
      showAlert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!email.includes('@')) {
      showAlert('Atenção', 'Digite um e-mail válido.');
      return;
    }

    setLoading(true);

    // 2. Envio do e-mail de redefinição com link de direcionamento
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'http://localhost:8081/reset-password',
    });

    setLoading(false);

    // 3. Tratamento de Erro
    if (error) {
      showAlert('Erro ao enviar', error.message);
      return;
    }

    // 4. Sucesso[cite: 5]
    showAlert(
      'Sucesso',
      'Instruções para redefinição de senha foram enviadas para o seu e-mail.',
      () => router.back()
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="#020617" />

        <View style={styles.topBackground} />

        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <Text style={styles.icon}>🔑</Text>

            <Text style={styles.title}>RECUPERAR ACESSO</Text>

            <Text style={styles.subtitle}>
              Informe o e-mail cadastrado para receber as instruções de redefinição de senha.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <Pressable
            onPress={handleResetPassword}
            disabled={loading}
            style={({ pressed, hovered }) => [
              styles.button,
              {
                transform: [
                  {
                    scale: pressed ? 0.96 : hovered ? 1.03 : 1,
                  },
                ],
                shadowOpacity: hovered ? 0.45 : 0.2,
              },
              loading && { opacity: 0.7 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Enviar Instruções</Text>
            )}
          </Pressable>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>← Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#042F2E',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },

  card: {
    backgroundColor: '#07111f',
    width: '100%',
    maxWidth: 420,
    padding: 32,
    borderRadius: 28,

    borderWidth: 1,
    borderColor: '#00F5D4',

    shadowColor: '#00F5D4',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  icon: {
    fontSize: 52,
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00F5D4',
    letterSpacing: 2,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },

  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00F5D4',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  input: {
    backgroundColor: '#020617',
    borderWidth: 1.5,
    borderColor: '#134E4A',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },

  button: {
    backgroundColor: '#0F766E',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,

    borderWidth: 1,
    borderColor: '#14B8A6',

    shadowColor: '#14B8A6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  backButton: {
    marginTop: 24,
    alignItems: 'center',
    padding: 8,
  },

  backButtonText: {
    color: '#00F5D4',
    fontSize: 14,
    fontWeight: '700',
  },
});