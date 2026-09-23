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

// Importação do seu client Supabase (ajuste o caminho se necessário)
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper para os alertas funcionarem corretamente no Navegador Web e no App Mobile
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    // 1. Validações locais dos campos
    if (!email.trim()) {
      showAlert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!email.includes('@')) {
      showAlert('Atenção', 'Digite um e-mail válido.');
      return;
    }

    if (!password.trim()) {
      showAlert('Atenção', 'Digite sua senha.');
      return;
    }

    // 2. Autenticação com o Supabase
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    // 3. Validação de erro (Usuário inexistente ou senha errada)
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        showAlert('Erro ao entrar', 'E-mail ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        showAlert(
          'E-mail não confirmado',
          'Confirme seu e-mail de cadastro antes de realizar o login.'
        );
      } else {
        showAlert('Erro no login', error.message);
      }
      return;
    }

    // 4. Sucesso -> Direciona o usuário autenticado para as rotas protegidas
    if (data.session) {
      router.replace('/main');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#020617"
      />

      <View style={styles.topBackground} />

      <View style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💼</Text>

          <Text style={styles.brandName}>
            DESBUROCRATA
          </Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              Sistema Online
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Análise e organização inteligente de documentos.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            E-mail
          </Text>

          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Senha
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            (pressed || loading) && styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Entrar na Plataforma
            </Text>
          )}
        </Pressable>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/cadastro')}
            disabled={loading}
          >
            <Text style={styles.linkTextPrimary}>
              Criar Conta
            </Text>
          </TouchableOpacity>

          <Text style={styles.divider}>
            |
          </Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.linkTextSecondary}>
              Esqueci a senha
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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

  loginCard: {
    width: '100%',
    maxWidth: 420,
    padding: 32,
    borderRadius: 28,

    backgroundColor: '#07111F',

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

  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logoIcon: {
    fontSize: 52,
    marginBottom: 12,
  },

  brandName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#00F5D4',
    letterSpacing: 3,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 12,
    marginBottom: 12,

    backgroundColor: 'rgba(0, 245, 212, 0.12)',

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 25,
  },

  statusDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: '#00F5D4',

    marginRight: 8,
  },

  statusText: {
    color: '#00F5D4',
    fontSize: 12,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',

    textAlign: 'center',
    lineHeight: 22,

    marginTop: 8,
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

    marginTop: 18,

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

  buttonPressed: {
    opacity: 0.85,

    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 16,
    fontWeight: '800',

    letterSpacing: 0.5,
  },

  footerLinks: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 28,
  },

  linkButton: {
    padding: 6,
  },

  linkTextPrimary: {
    color: '#00F5D4',

    fontSize: 15,
    fontWeight: '700',
  },

  linkTextSecondary: {
    color: '#CBD5E1',

    fontSize: 14,
  },

  divider: {
    color: '#334155',

    marginHorizontal: 12,
  },
});