import React, { useState } from 'react'; // React + hook de estado
import {
  Image,                  // exibe imagens (logo)
  KeyboardAvoidingView,   // evita que o teclado cubra os campos
  Platform,               // detecta o sistema (iOS/Android/web)
  ScrollView,             // permite rolar o conteúdo
  StyleSheet,             // cria estilos
  Text,                   // texto
  TouchableOpacity,       // área tocável (links)
  View,                   // container
} from 'react-native';
import { Link, router } from 'expo-router'; // Link: navegação declarativa; router: navegação imperativa
import { theme } from '../constants/theme';        // tokens de design
import { useAuth } from '../contexts/AuthContext'; // hook de autenticação
import Button from '../components/Button';         // botão reutilizável
import Input from '../components/Input';           // campo reutilizável

// Expressão regular simples para validar formato de e-mail (algo@algo.algo).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Tela de login.
export default function LoginScreen() {
  const { login } = useAuth();                       // função de login do contexto
  const [email, setEmail] = useState('');            // estado do campo e-mail
  const [password, setPassword] = useState('');      // estado do campo senha
  const [error, setError] = useState<string | null>(null); // mensagem de erro (ou null)
  const [loading, setLoading] = useState(false);     // controla o spinner do botão

  // Função executada ao tocar em "Entrar".
  const onSubmit = async () => {
    // Validação: e-mail no formato certo e senha com pelo menos 6 caracteres.
    if (!EMAIL_RE.test(email) || password.length < 6) {
      setError('Informe um e-mail válido e a senha (mín. 6 caracteres).');
      return; // interrompe se inválido
    }
    setError(null);     // limpa erros anteriores
    setLoading(true);   // ativa o carregamento
    try {
      // TODO POST /auth/login
      await login(email, password);   // faz login (hoje é mock)
      router.replace('/(tabs)');      // vai para a área logada (abas) - replace = sem voltar p/ login
    } finally {
      setLoading(false); // desativa o carregamento, mesmo se der erro
    }
  };

  return (
    // No iOS, empurra o conteúdo p/ cima quando o teclado abre; em outros, não faz nada.
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // permite tocar em botões com o teclado aberto
      >
        <View style={styles.card}>
          {/* Logo do app. require() carrega a imagem local de assets/. */}
          <Image
            source={require('../assets/logo_bombabet.png')}
            style={styles.logo}
            resizeMode="contain" // mostra a logo inteira, sem cortar
            accessibilityLabel="Bomba Bet"
          />
          {/* Selo estilo "Bomba Patch": chama atenção logo abaixo da logo. */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100% ATUALIZADO</Text>
          </View>
          <Text style={styles.subtitle}>Entre na sua conta</Text>

          {/* Campo de e-mail */}
          <Input
            label="E-mail"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}        // atualiza o estado a cada digitação
            placeholder="seu@email.com"
            keyboardType="email-address"   // teclado otimizado p/ e-mail
            autoCapitalize="none"          // não coloca maiúscula automática
            autoComplete="email"           // sugere e-mails salvos
          />
          {/* Campo de senha (oculta o texto; mostra o erro de validação aqui) */}
          <Input
            label="Senha"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry                // esconde os caracteres
            error={error}
          />

          {/* Link para recuperar senha. asChild faz o Link usar o filho como gatilho. */}
          <Link href="/forgot-password" asChild>
            <TouchableOpacity
              style={styles.forgot}
              accessibilityRole="link"
              accessibilityLabel="Esqueci minha senha"
            >
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </Link>

          {/* Botão principal de login */}
          <Button
            title="Entrar"
            onPress={onSubmit}
            loading={loading}
            style={styles.submit}
          />

          {/* Rodapé com link para cadastro */}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos da tela.
const styles = StyleSheet.create({
  flex: {
    flex: 1,                          // ocupa toda a tela
    backgroundColor: theme.colors.bg, // fundo escuro
  },
  scrollContent: {
    flexGrow: 1,                 // permite centralizar mesmo com pouco conteúdo
    justifyContent: 'center',    // centraliza verticalmente
    alignItems: 'center',        // centraliza horizontalmente
    padding: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,               // limita a largura (importante no navegador/web)
    // Platform.select aplica estilos diferentes por plataforma:
    // na web, vira um "cartão" com fundo/borda; no celular, sem nada extra.
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
    width: '100%',     // largura disponível; o contain reduz mantendo a proporção
    height: 80,        // altura fixa pequena (ajuste este número p/ deixar maior/menor)
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    alignSelf: 'center',                 // centraliza o selo
    backgroundColor: theme.colors.accent, // fundo dourado chamativo
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,     // formato de pílula
    borderWidth: 2,
    borderColor: theme.colors.accentText, // contorno escuro p/ destacar
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    transform: [{ rotate: '-8deg' }],    // leve inclinação estilo carimbo
  },
  badgeText: {
    ...theme.font.label,
    color: theme.colors.accentText,      // texto escuro sobre o dourado
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
    alignSelf: 'flex-end',           // alinha o link à direita
    marginTop: -theme.spacing.sm,    // sobe um pouco (margem negativa)
    marginBottom: theme.spacing.sm,
    minHeight: 32,                   // área tocável mínima
    justifyContent: 'center',
  },
  forgotText: {
    ...theme.font.label,
    color: theme.colors.accent,      // dourado
  },
  submit: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',            // texto + link na mesma linha
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
