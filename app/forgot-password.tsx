import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

import { supabase } from '../lib/supabase';

const THEME = {
  bg: '#070710',
  card: '#12121F',
  primary: '#7B6EF6',
  primaryDark: '#5B4FE8',
  accent: '#00E5C3',
  text: '#F1F1F6',
  textSoft: '#C0C0D0',
  textMuted: '#6B6B80',
  border: 'rgba(255,255,255,0.08)',
  inputBg: '#090911',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      if (onPress) onPress();
    } else {
      Alert.alert(title, message, onPress ? [{ text: 'OK', onPress }] : undefined);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      showAlert('Atenção', 'Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'http://localhost:8081/reset-password',
    });
    setLoading(false);

    if (error) {
      showAlert('Erro ao enviar', error.message);
      return;
    }

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
        <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={styles.iconBadge}>
              <Ionicons name="key-outline" size={30} color={THEME.accent} />
            </View>

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
              placeholderTextColor={THEME.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <Pressable onPress={handleResetPassword} disabled={loading} style={styles.buttonWrapper}>
            <LinearGradient
              colors={[THEME.primary, THEME.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Enviar Instruções</Text>
              )}
            </LinearGradient>
          </Pressable>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
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
    backgroundColor: THEME.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: THEME.card,
    width: '100%',
    maxWidth: 420,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 195, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 195, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textSoft,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textSoft,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: THEME.inputBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: THEME.text,
  },
  buttonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 6,
  },
  backButtonText: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});