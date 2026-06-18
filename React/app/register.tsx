import React, { useState } from 'react'; // React + hook de estado
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
import { router } from 'expo-router';              // navegação imperativa
import { theme } from '../constants/theme';        // tokens de design
import { useAuth } from '../contexts/AuthContext'; // hook de autenticação
import Button from '../components/Button';
import Input from '../components/Input';

// Regex para validar formato de e-mail.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Formato do objeto de erros: cada campo pode ter (ou não) uma mensagem.
type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

// Tela de cadastro de nova conta.
export default function RegisterScreen() {
  const { login } = useAuth();                          // reutiliza login p/ já entrar após cadastrar
  const [name, setName] = useState('');                 // estado do nome
  const [email, setEmail] = useState('');               // estado do e-mail
  const [password, setPassword] = useState('');         // estado da senha
  const [confirm, setConfirm] = useState('');           // estado da confirmação de senha
  const [errors, setErrors] = useState<Errors>({});     // erros por campo
  const [loading, setLoading] = useState(false);        // spinner do botão

  // Valida todos os campos e devolve true se estiver tudo certo.
  const validate = (): boolean => {
    const next: Errors = {}; // acumula erros encontrados
    if (!name.trim()) next.name = 'Informe seu nome.';                       // nome obrigatório
    if (!EMAIL_RE.test(email)) next.email = 'E-mail inválido.';              // e-mail válido
    if (password.length < 6) next.password = 'A senha deve ter ao menos 6 caracteres.'; // senha mínima
    if (confirm !== password) next.confirm = 'As senhas não coincidem.';    // confirmação igual
    setErrors(next); // atualiza o estado de erros (mostra nas telas)
    return Object.keys(next).length === 0; // true se não houver nenhuma chave de erro
  };

  // Executa ao tocar em "Cadastrar".
  const onSubmit = async () => {
    if (!validate()) return; // se inválido, para aqui
    setLoading(true);
    try {
      // TODO POST /auth/register
      await login(email, password); // simula o cadastro fazendo login (mock)
      router.replace('/(tabs)');    // vai para a área logada
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

          {/* Campo nome (erro específico vem de errors.name) */}
          <Input
            label="Nome"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
            autoCapitalize="words" // capitaliza cada palavra
            error={errors.name}
          />
          {/* Campo e-mail */}
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
          {/* Campo senha */}
          <Input
            label="Senha"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.password}
          />
          {/* Campo confirmação de senha */}
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

          {/* Rodapé: voltar para o login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity
              onPress={() => router.back()} // volta à tela anterior (login)
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

// Estilos (idênticos em espírito aos da tela de login).
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
