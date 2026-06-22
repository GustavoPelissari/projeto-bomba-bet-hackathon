import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  /** Remove o padding padrão (útil para listas full-bleed). */
  noPadding?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Padroniza fundo, área segura e padding de todas as telas.
export default function ScreenContainer({ children, noPadding, style }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.content, noPadding && styles.noPadding, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  noPadding: {
    padding: 0,
  },
});
