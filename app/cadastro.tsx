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

export default function CadastroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    // 1. Validações locais do formulário
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite seu nome completo.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Atenção', 'Digite um e-mail válido.');
      return;
    }

    if (!senha.trim()) {
      Alert.alert('Atenção', 'Crie uma senha.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert(
        'Senha muito curta',
        'A senha deve possuir pelo menos 6 caracteres.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        'Senhas diferentes',
        'A confirmação de senha deve ser igual à senha.'
      );
      return;
    }

    // 2. Conexão e cadastro no Supabase
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          full_name: nome.trim(), // Salva o nome nos metadados da conta do usuário
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro no cadastro', error.message);
      return;
    }

    // 3. Verificação de envio / sucesso
    // Se a confirmação de e-mail estiver ativada no seu painel Supabase, o usuário receberá um e-mail.
    if (data.session) {
      Alert.alert('Sucesso!', 'Sua conta foi criada e você já está logado.');
      router.replace('/'); // Redireciona para a tela inicial/principal
    } else {
      Alert.alert(
        'Cadastro realizado!',
        'Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada antes de fazer o login.'
      );
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View style={styles.topBackground} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cadastroCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>💼</Text>

            <Text style={styles.brandName}>DESBUROCRATA</Text>

            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Novo Cadastro</Text>
            </View>

            <Text style={styles.title}>Crie sua conta</Text>

            <Text style={styles.subtitle}>
              Cadastre-se para acessar a plataforma e organizar seus documentos.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#64748B"
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
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Crie uma senha"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              A senha deve possuir pelo menos 6 caracteres.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha novamente"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              editable={!loading}
            />
          </View>

          <Pressable
            onPress={handleCadastro}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              (pressed || loading) && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Criar minha conta</Text>
            )}
          </Pressable>

          <View style={styles.loginArea}>
            <Text style={styles.loginText}>Já possui uma conta?</Text>

            <Pressable
              onPress={() => router.back()}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
              ]}
            >
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
    backgroundColor: '#020617',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: '#042F2E',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 35,
  },
  cadastroCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#07111F',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#00F5D4',
    shadowColor: '#00F5D4',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 46,
    marginBottom: 8,
  },
  brandName: {
    color: '#00F5D4',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 30,
    backgroundColor: 'rgba(0,245,212,0.10)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F5D4',
    marginRight: 7,
  },
  statusText: {
    color: '#00F5D4',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 18,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#00F5D4',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    color: '#FFFFFF',
    backgroundColor: '#020617',
    borderWidth: 1.5,
    borderColor: '#134E4A',
    borderRadius: 15,
    paddingHorizontal: 17,
    paddingVertical: 15,
    fontSize: 15,
  },
  helperText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 17,
    marginTop: 7,
    borderWidth: 1,
    borderColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.8,
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
    letterSpacing: 0.4,
  },
  loginArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  loginButton: {
    paddingVertical: 5,
    paddingLeft: 8,
  },
  loginButtonPressed: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#00F5D4',
    fontSize: 14,
    fontWeight: '800',
  },
});