import React from 'react'; // necessário para usar JSX (o "HTML" do React)
// Importa componentes nativos prontos do React Native + tipos auxiliares de estilo.
import {
  ActivityIndicator,    // spinner de carregamento
  StyleSheet,           // cria objetos de estilo otimizados
  Text,                 // exibe texto
  TouchableOpacity,     // área tocável que escurece levemente ao pressionar
  View,                 // container genérico (como uma <div>)
  type StyleProp,       // tipo: permite receber estilos por prop
  type ViewStyle,       // tipo: estilo aplicável a uma View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // biblioteca de ícones
import { theme } from '../constants/theme';     // tokens de design (cores, espaçamentos...)

// Variantes visuais do botão: principal, "fantasma" (contorno) e de perigo.
type Variant = 'primary' | 'ghost' | 'danger';

// Props (propriedades) que o componente Button aceita.
type Props = {
  title: string;                 // texto do botão
  onPress?: () => void;          // função chamada ao tocar (opcional)
  variant?: Variant;             // estilo visual (opcional)
  loading?: boolean;             // mostra spinner quando true (opcional)
  disabled?: boolean;            // desabilita o botão (opcional)
  fullWidth?: boolean;           // ocupa 100% da largura (opcional)
  icon?: keyof typeof Ionicons.glyphMap; // nome de um ícone válido do Ionicons (opcional)
  style?: StyleProp<ViewStyle>;  // estilos extras vindos de fora (opcional)
  accessibilityHint?: string;    // dica de acessibilidade p/ leitores de tela (opcional)
};

// Componente Button. Recebe as props com valores padrão definidos na desestruturação.
export default function Button({
  title,
  onPress,
  variant = 'primary',  // padrão: botão principal
  loading = false,      // padrão: sem carregamento
  disabled = false,     // padrão: habilitado
  fullWidth = true,     // padrão: largura total
  icon,
  style,
  accessibilityHint,
}: Props) {
  // Botão fica inativo se estiver desabilitado OU carregando.
  const isDisabled = disabled || loading;
  // Cor do texto: escura sobre o dourado (primary) ou branca nas demais variantes.
  const textColor =
    variant === 'primary' ? theme.colors.accentText : theme.colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={onPress}              // ação ao tocar
      disabled={isDisabled}         // impede toque quando inativo
      activeOpacity={0.85}          // opacidade ao pressionar (efeito visual)
      accessibilityRole="button"    // informa ao leitor de tela que é um botão
      accessibilityLabel={title}    // rótulo lido pelo leitor de tela
      accessibilityHint={accessibilityHint} // dica adicional de acessibilidade
      accessibilityState={{ disabled: isDisabled, busy: loading }} // estado p/ acessibilidade
      style={[
        styles.base,                       // estilos comuns a todos os botões
        styles[variant],                   // estilo específico da variante escolhida
        fullWidth && styles.fullWidth,     // adiciona largura total se fullWidth
        isDisabled && styles.disabled,     // reduz opacidade se inativo
        style,                             // estilos extras vindos por prop (vêm por último = prioridade)
      ]}
    >
      {loading ? (
        // Se está carregando, mostra o spinner no lugar do conteúdo.
        <ActivityIndicator color={textColor} />
      ) : (
        // Caso contrário, mostra (ícone opcional +) texto lado a lado.
        <View style={styles.content}>
          {icon ? (
            <Ionicons name={icon} size={18} color={textColor} /> // ícone, se informado
          ) : null}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Folha de estilos do componente (separa visual da lógica).
const styles = StyleSheet.create({
  base: {
    minHeight: 52,                          // altura mínima confortável p/ toque
    borderRadius: theme.radius.md,          // cantos arredondados
    paddingHorizontal: theme.spacing.lg,    // espaço interno nas laterais
    alignItems: 'center',                   // centraliza conteúdo no eixo vertical
    justifyContent: 'center',               // centraliza no eixo horizontal
  },
  fullWidth: {
    width: '100%',                          // ocupa toda a largura disponível
  },
  content: {
    flexDirection: 'row',                   // ícone e texto na horizontal
    alignItems: 'center',                   // alinhados verticalmente ao centro
    gap: theme.spacing.sm,                  // espaço entre ícone e texto
  },
  primary: {
    backgroundColor: theme.colors.accent,   // fundo dourado
  },
  ghost: {
    backgroundColor: 'transparent',         // sem fundo
    borderWidth: 1,                         // só contorno
    borderColor: theme.colors.border,       // borda cinza
  },
  danger: {
    backgroundColor: 'transparent',         // sem fundo
    borderWidth: 1,                         // só contorno
    borderColor: theme.colors.danger,       // borda vermelha
  },
  disabled: {
    opacity: 0.5,                           // meio transparente quando inativo
  },
  text: {
    ...theme.font.title,                    // aplica tamanho/peso de "title" do tema
  },
});
