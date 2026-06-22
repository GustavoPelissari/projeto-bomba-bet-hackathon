import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../constants/theme';
import { forgotPassword, resetPassword } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = 'request' | 'reset' | 'done';

export default function ForgotPasswordScreen() {
  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Etapa 1: solicita o token de recuperação para o e-mail.
  const onRequest = async () => {
    if (!EMAIL_RE.test(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const t = await forgotPassword(email);
      setToken(t);
      setStage('reset');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível solicitar a recuperação.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Etapa 2: redefine a senha usando o token.
  const onReset = async () => {
    if (!token.trim()) {
      setError('Informe o código de recuperação.');
      return;
    }
    if (password.length < 6) {
      setError('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      setStage('done');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível redefinir a senha.'
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
          <View style={styles.iconCircle}>
            <Ionicons
              name={stage === 'done' ? 'checkmark-circle-outline' : 'lock-closed-outline'}
              size={32}
              color={theme.colors.accent}
              accessible={false}
            />
          </View>

          {stage === 'request' && (
            <>
              <Text style={styles.title} accessibilityRole="header">
                Recuperar senha
              </Text>
              <Text style={styles.description}>
                Informe o e-mail da sua conta para receber o código de
                redefinição de senha.
              </Text>

              <Input
                label="E-mail"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={error}
              />

              <Button title="Enviar código" onPress={onRequest} loading={loading} />

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.back()}
                accessibilityRole="link"
                accessibilityLabel="Voltar ao login"
              >
                <Text style={styles.backLinkText}>Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}

          {stage === 'reset' && (
            <>
              <Text style={styles.title} accessibilityRole="header">
                Redefinir senha
              </Text>
              <Text style={styles.description}>
                Em produção o código vai por e-mail. Para teste, ele já foi
                preenchido abaixo. Defina sua nova senha.
              </Text>

              <Input
                label="Código de recuperação"
                icon="key-outline"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
              />
              <Input
                label="Nova senha"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
              />
              <Input
                label="Confirmar nova senha"
                icon="lock-closed-outline"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repita a senha"
                secureTextEntry
                error={error}
              />

              <Button title="Redefinir senha" onPress={onReset} loading={loading} />

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.back()}
                accessibilityRole="link"
                accessibilityLabel="Voltar ao login"
              >
                <Text style={styles.backLinkText}>Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}

          {stage === 'done' && (
            <>
              <Text style={styles.title} accessibilityRole="header">
                Senha redefinida!
              </Text>
              <Text style={styles.description} accessibilityLiveRegion="polite">
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </Text>
              <Button
                title="Ir para o login"
                icon="arrow-back"
                onPress={() => router.replace('/login')}
                style={styles.submit}
              />
            </>
          )}
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  submit: {
    marginTop: theme.spacing.sm,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
    minHeight: 32,
    justifyContent: 'center',
  },
  backLinkText: {
    ...theme.font.label,
    color: theme.colors.accent,
  },
});
