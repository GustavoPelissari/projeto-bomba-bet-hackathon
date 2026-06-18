import React, { useState } from 'react'; // React + hook de estado local
import {
  StyleSheet,         // cria estilos
  Text,               // texto (rótulo e mensagem de erro)
  TextInput,          // campo de digitação
  TouchableOpacity,   // botão tocável (ícone de mostrar/ocultar senha)
  View,               // container
  type TextInputProps, // tipo com todas as props nativas de um TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ícones
import { theme } from '../constants/theme';     // tokens de design

// Props do Input: herda TODAS as props de um TextInput nativo e adiciona as nossas.
type Props = TextInputProps & {
  label: string;                          // rótulo acima do campo
  icon?: keyof typeof Ionicons.glyphMap;  // ícone à esquerda (opcional)
  error?: string | null;                  // mensagem de erro (opcional)
  secureTextEntry?: boolean;              // se true, é campo de senha (oculta o texto)
};

// Componente Input. Extrai props próprias e junta o resto em "rest".
export default function Input({
  label,
  icon,
  error,
  secureTextEntry,
  style,
  ...rest // demais props nativas (placeholder, value, onChangeText, etc.)
}: Props) {
  // Estado: campo está focado? (controla a cor da borda)
  const [focused, setFocused] = useState(false);
  // Estado: texto está oculto? Começa oculto se for campo de senha. "!!" converte p/ booleano.
  const [hidden, setHidden] = useState(!!secureTextEntry);

  // Atalho booleano: existe mensagem de erro?
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>{/* rótulo do campo */}
      <View
        style={[
          styles.field,                       // estilo base do campo
          focused && styles.fieldFocused,     // borda dourada quando focado
          hasError && styles.fieldError,      // borda vermelha quando há erro
        ]}
      >
        {icon ? (
          // Ícone decorativo à esquerda (accessible=false: leitor de tela ignora).
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            accessible={false}
          />
        ) : null}
        <TextInput
          style={[styles.input, style]}                 // estilo do campo + extras
          placeholderTextColor={theme.colors.textSecondary} // cor do texto de exemplo
          secureTextEntry={hidden}                      // oculta o texto se "hidden"
          onFocus={(e) => {
            setFocused(true);     // marca como focado (muda a borda)
            rest.onFocus?.(e);    // chama o onFocus externo, se existir
          }}
          onBlur={(e) => {
            setFocused(false);    // tira o foco
            rest.onBlur?.(e);     // chama o onBlur externo, se existir
          }}
          accessibilityLabel={label}  // leitor de tela anuncia o rótulo
          {...rest}                   // repassa todas as demais props nativas
        />
        {secureTextEntry ? (
          // Botão "olho" para mostrar/ocultar a senha (só em campos de senha).
          <TouchableOpacity
            onPress={() => setHidden((p) => !p)} // inverte o estado oculto/visível
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} // aumenta a área tocável
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'} // ícone conforme estado
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {hasError ? (
        // Linha de erro: ícone de alerta + texto, só quando há mensagem.
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={theme.colors.danger}
            accessible={false}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Estilos do componente.
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.lg,         // espaço abaixo de cada campo
  },
  label: {
    ...theme.font.label,                    // tipografia de rótulo
    color: theme.colors.textSecondary,      // cor cinza
    marginBottom: theme.spacing.xs + 2,     // pequeno espaço abaixo do rótulo
  },
  field: {
    flexDirection: 'row',                   // ícone + input + olho na horizontal
    alignItems: 'center',                   // centraliza verticalmente
    backgroundColor: theme.colors.surface,  // fundo do campo
    borderWidth: 1,                         // espessura da borda
    borderColor: theme.colors.border,       // cor padrão da borda
    borderRadius: theme.radius.md,          // cantos arredondados
    minHeight: 52,                          // altura confortável
    paddingHorizontal: theme.spacing.lg - 2, // espaço interno lateral
    gap: theme.spacing.md - 2,              // espaço entre os elementos internos
  },
  fieldFocused: {
    borderColor: theme.colors.accent,       // borda dourada ao focar
  },
  fieldError: {
    borderColor: theme.colors.danger,       // borda vermelha em caso de erro
  },
  input: {
    flex: 1,                                // ocupa todo o espaço restante
    color: theme.colors.textPrimary,        // cor do texto digitado
    ...theme.font.body,                     // tipografia de corpo
    paddingVertical: theme.spacing.md,      // espaço interno em cima/baixo
  },
  errorRow: {
    flexDirection: 'row',                   // ícone + texto de erro lado a lado
    alignItems: 'center',
    gap: theme.spacing.xs,                  // espaço entre eles
    marginTop: theme.spacing.xs + 2,        // espaço acima da linha de erro
  },
  errorText: {
    ...theme.font.caption,                  // tipografia pequena
    color: theme.colors.danger,             // texto vermelho
  },
});
