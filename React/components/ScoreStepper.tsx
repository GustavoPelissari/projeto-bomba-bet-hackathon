import React from 'react'; // necessário para JSX
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ícones (+ e -)
import { theme } from '../constants/theme';     // tokens de design

// Props do "stepper" (seletor de número com botões + e -).
type Props = {
  label: string;                       // rótulo (ex.: nome do time)
  value: number;                       // valor atual (gols)
  onChange: (value: number) => void;   // chamada quando o valor muda
  min?: number;                        // valor mínimo (padrão 0)
  max?: number;                        // valor máximo (padrão 20)
  disabled?: boolean;                  // desabilita os botões
};

// Componente para escolher o placar de um time, aumentando/diminuindo de 1 em 1.
export default function ScoreStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  disabled = false,
}: Props) {
  // Diminui 1, sem passar do mínimo. Math.max garante que não fique abaixo de "min".
  const dec = () => onChange(Math.max(min, value - 1));
  // Aumenta 1, sem passar do máximo. Math.min garante que não passe de "max".
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label} numberOfLines={1}>{/* rótulo em 1 linha */}
        {label}
      </Text>
      <View style={styles.controls}>
        {/* Botão de diminuir */}
        <TouchableOpacity
          onPress={dec}
          disabled={disabled || value <= min} // desativa no mínimo
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Diminuir gols de ${label}`}
          accessibilityState={{ disabled: disabled || value <= min }}
          style={[
            styles.button,
            (disabled || value <= min) && styles.buttonDisabled, // estilo "apagado" quando inativo
          ]}
        >
          <Ionicons name="remove" size={24} color={theme.colors.accentText} />
        </TouchableOpacity>

        {/* Número atual no centro */}
        <Text
          style={styles.value}
          accessibilityLabel={`${label}: ${value} gols`} // leitura acessível do valor
        >
          {value}
        </Text>

        {/* Botão de aumentar */}
        <TouchableOpacity
          onPress={inc}
          disabled={disabled || value >= max} // desativa no máximo
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar gols de ${label}`}
          accessibilityState={{ disabled: disabled || value >= max }}
          style={[
            styles.button,
            (disabled || value >= max) && styles.buttonDisabled,
          ]}
        >
          <Ionicons name="add" size={24} color={theme.colors.accentText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos.
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',     // centraliza rótulo e controles
    gap: theme.spacing.sm,    // espaço entre rótulo e controles
    flex: 1,                  // divide o espaço igualmente quando há dois steppers lado a lado
  },
  label: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',     // [-] valor [+] na horizontal
    alignItems: 'center',
    gap: theme.spacing.md,    // espaço entre eles
  },
  button: {
    width: 48,                // botão quadrado de 48x48 (bom para toque)
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent, // fundo dourado
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,             // meio transparente quando no limite
  },
  value: {
    ...theme.font.h1,         // número grande
    color: theme.colors.textPrimary,
    minWidth: 40,            // largura mínima p/ o layout não "pular" ao mudar de 9 p/ 10
    textAlign: 'center',
  },
});
