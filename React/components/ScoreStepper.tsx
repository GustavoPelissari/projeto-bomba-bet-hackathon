import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

// Seletor de placar com botões + e -, limitado entre min e max.
export default function ScoreStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  disabled = false,
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={dec}
          disabled={disabled || value <= min}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Diminuir gols de ${label}`}
          accessibilityState={{ disabled: disabled || value <= min }}
          style={[
            styles.button,
            (disabled || value <= min) && styles.buttonDisabled,
          ]}
        >
          <Ionicons name="remove" size={24} color={theme.colors.accentText} />
        </TouchableOpacity>

        <Text
          style={styles.value}
          accessibilityLabel={`${label}: ${value} gols`}
        >
          {value}
        </Text>

        <TouchableOpacity
          onPress={inc}
          disabled={disabled || value >= max}
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

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  label: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  value: {
    ...theme.font.h1,
    color: theme.colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
});
