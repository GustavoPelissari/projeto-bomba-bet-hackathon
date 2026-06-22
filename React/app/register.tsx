import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Valida todos os campos e devolve true se estiver tudo certo.
  const validate = (): boolean => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Informe seu nome.';
    if (!EMAIL_RE.test(email)) next.email = 'E-mail inválido.';
    if (password.length < 6) next.password = 'A senha deve ter ao menos 6 caracteres.';
    if (confirm !== password) next.confirm = 'As senhas não coincidem.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/(tabs)');
    } catch (e) {
      setErrors({
        email: e instanceof Error ? e.message : 'Não foi possível cadastrar.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Image
            source={require('../assets/logo_bombabet.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Bomba Bet"
          />
          <Text style={styles.subtitle}>Crie sua conta</Text>

          <Input
            label="Nome"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
            autoCapitalize="words"
            error={errors.name}
          />
          <Input
            label="E-mail"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Senha"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Confirmar senha"
            icon="lock-closed-outline"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repita a senha"
            secureTextEntry
            error={errors.confirm}
          />

          <Button
            title="Cadastrar"
            onPress={onSubmit}
            loading={loading}
            style={styles.submit}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="link"
              accessibilityLabel="Entrar"
            >
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    ...Platform.select({
      web: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.xl,
      },
      default: {},
    }),
  },
  logo: {
    height: 64,
    width: '100%',
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl + 4,
  },
  submit: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  footerLink: {
    ...theme.font.body,
    color: theme.colors.accent,
    fontWeight: '700',
  },
});
