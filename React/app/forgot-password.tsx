import React, { useState } from 'react'; // React + hook de estado
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ícones
import { router } from 'expo-router';            // navegação imperativa
import { theme } from '../constants/theme';      // tokens de design
import Button from '../components/Button';
import Input from '../components/Input';

// Regex para validar formato de e-mail.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Tela de recuperação de senha.
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');                   // estado do e-mail
  const [error, setError] = useState<string | null>(null);  // mensagem de erro
  const [loading, setLoading] = useState(false);            // spinner do botão
  const [sent, setSent] = useState(false);                  // já enviou o link? (muda a tela)

  // Executa ao tocar em "Enviar link".
  const onSubmit = async () => {
    // Valida o e-mail antes de "enviar".
    if (!EMAIL_RE.test(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // TODO POST /auth/forgot-password
      await new Promise((r) => setTimeout(r, 600)); // simula a espera da rede (600ms)
      setSent(true); // marca como enviado -> mostra a mensagem de sucesso
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
          {/* Círculo com ícone que muda conforme já enviou ou não. */}
          <View style={styles.iconCircle}>
            <Ionicons
              name={sent ? 'mail-open-outline' : 'lock-closed-outline'}
              size={32}
              color={theme.colors.accent}
              accessible={false}
            />
          </View>

          {sent ? (
            // ----- Estado: link já enviado -----
            // <> </> é um Fragment: agrupa elementos sem criar uma View extra.
            <>
              <Text style={styles.title} accessibilityRole="header">
                E-mail enviado
              </Text>
              <Text style={styles.description} accessibilityLiveRegion="polite">
                Enviamos um link para {email}. Verifique sua caixa de entrada.
              </Text>
              <Button
                title="Voltar ao login"
                icon="arrow-back"
                onPress={() => router.back()} // volta à tela anterior
                style={styles.submit}
              />
            </>
          ) : (
            // ----- Estado: formulário inicial -----
            <>
              <Text style={styles.title} accessibilityRole="header">
                Recuperar senha
              </Text>
              <Text style={styles.description}>
                Informe o e-mail da sua conta para receber o link de redefinição
                de senha.
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

              <Button
                title="Enviar link"
                onPress={onSubmit}
                loading={loading}
              />

              {/* Link de texto para voltar ao login */}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos.
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
    borderRadius: theme.radius.full,         // círculo perfeito
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
