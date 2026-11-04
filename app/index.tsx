import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) return showAlert('Atenção', 'Digite seu e-mail.');
    if (!email.includes('@')) return showAlert('Atenção', 'Digite um e-mail válido.');
    if (!password.trim()) return showAlert('Atenção', 'Digite sua senha.');

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        showAlert('Erro ao entrar', 'E-mail ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        showAlert('E-mail não confirmado', 'Confirme seu e-mail de cadastro antes de realizar o login.');
      } else {
        showAlert('Erro no login', error.message);
      }
      return;
    }

    if (data.session) {
      router.replace('/main');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      <View style={styles.ambientGlow} />

      <View style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBadge}>
            <Ionicons name="briefcase-outline" size={32} color={THEME.accent} />
          </View>

          <Text style={styles.brandName}>DESBUROCRATA</Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Sistema Online</Text>
          </View>

          <Text style={styles.subtitle}>
            Análise e organização inteligente de documentos.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor={THEME.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor={THEME.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        <Pressable onPress={handleLogin} disabled={loading} style={styles.buttonWrapper}>
          <LinearGradient
            colors={[THEME.primary, THEME.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar na Plataforma</Text>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/cadastro')}
            disabled={loading}
          >
            <Text style={styles.linkTextPrimary}>Criar Conta</Text>
          </TouchableOpacity>

          <Text style={styles.divider}>|</Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.linkTextSecondary}>Esqueci a senha</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  ambientGlow: {
    position: 'absolute',
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: THEME.primary,
    opacity: 0.12,
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    padding: 28,
    borderRadius: 24,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 229, 195, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 195, 0.2)',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.text,
    letterSpacing: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 229, 195, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.accent,
    marginRight: 6,
  },
  statusText: {
    color: THEME.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textSoft,
    textAlign: 'center',
    marginTop: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
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
    marginTop: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkButton: {
    padding: 6,
  },
  linkTextPrimary: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  linkTextSecondary: {
    color: THEME.textMuted,
    fontSize: 14,
  },
  divider: {
    color: THEME.border,
    marginHorizontal: 10,
  },
});