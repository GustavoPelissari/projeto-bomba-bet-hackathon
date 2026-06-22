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
import { Link, router } from 'expo-router';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!EMAIL_RE.test(email) || password.length < 6) {
      setError('Informe um e-mail válido e a senha (mín. 6 caracteres).');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'E-mail ou senha inválidos.'
      );
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100% ATUALIZADO</Text>
          </View>
          <Text style={styles.subtitle}>Entre na sua conta</Text>

          <Input
            label="E-mail"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Senha"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
            error={error}
          />

          <Link href="/forgot-password" asChild>
            <TouchableOpacity
              style={styles.forgot}
              accessibilityRole="link"
              accessibilityLabel="Esqueci minha senha"
            >
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </Link>

          <Button
            title="Entrar"
            onPress={onSubmit}
            loading={loading}
            style={styles.submit}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity
                accessibilityRole="link"
                accessibilityLabel="Cadastre-se"
              >
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Button
            title="Acessar Ranking"
            variant="ghost"
            icon="trophy-outline"
            onPress={() => router.push('/ranking-publico')}
            style={styles.visitorBtn}
          />
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
    width: '100%',
    height: 80,
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.accentText,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    transform: [{ rotate: '-8deg' }],
  },
  badgeText: {
    ...theme.font.label,
    color: theme.colors.accentText,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl + 4,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    minHeight: 32,
    justifyContent: 'center',
  },
  forgotText: {
    ...theme.font.label,
    color: theme.colors.accent,
  },
  submit: {
    marginTop: theme.spacing.md,
  },
  visitorBtn: {
    marginTop: theme.spacing.lg,
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
