import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  /** Conteúdo opcional alinhado à direita (ex.: link "Ver todas"). */
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SectionHeader({ title, right, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  title: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
});
