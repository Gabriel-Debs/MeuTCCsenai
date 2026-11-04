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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

export default function CadastroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome.trim()) return Alert.alert('Atenção', 'Digite seu nome completo.');
    if (!email.trim() || !email.includes('@')) return Alert.alert('Atenção', 'Digite um e-mail válido.');
    if (!senha.trim() || senha.length < 6) return Alert.alert('Senha curta', 'A senha deve ter no mínimo 6 caracteres.');
    if (senha !== confirmarSenha) return Alert.alert('Senhas divergentes', 'As senhas não coincidem.');

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { full_name: nome.trim() } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Erro no cadastro', error.message);
      return;
    }

    if (data.session) {
      Alert.alert('Sucesso!', 'Conta criada com sucesso.');
      router.replace('/');
    } else {
      Alert.alert('Cadastro realizado!', 'Verifique seu e-mail para confirmar a conta.');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cadastroCard}>
          <View style={styles.logoContainer}>
            <View style={styles.iconBadge}>
              <Ionicons name="person-add-outline" size={30} color={THEME.accent} />
            </View>

            <Text style={styles.brandName}>DESBUROCRATA</Text>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Cadastre-se para começar a analisar seus documentos.</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor={THEME.textMuted}
              autoCapitalize="words"
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor={THEME.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={THEME.textMuted}
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor={THEME.textMuted}
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              editable={!loading}
            />
          </View>

          <Pressable onPress={handleCadastro} disabled={loading} style={styles.buttonWrapper}>
            <LinearGradient
              colors={[THEME.primary, THEME.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Criar minha conta</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.loginArea}>
            <Text style={styles.loginText}>Já possui uma conta?</Text>
            <Pressable onPress={() => router.back()} disabled={loading}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  cadastroCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 195, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 195, 0.2)',
  },
  brandName: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: THEME.textSoft,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    color: THEME.textSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    color: THEME.text,
    backgroundColor: THEME.inputBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
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
  loginArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  loginText: {
    color: THEME.textMuted,
    fontSize: 14,
  },
  loginButtonText: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});