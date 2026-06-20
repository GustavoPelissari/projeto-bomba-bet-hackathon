import React from 'react'; // necessário para JSX
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../constants/theme'; // tokens de design

// Props do cabeçalho de seção.
type Props = {
  title: string;             // título da seção
  /** Texto auxiliar à direita (ex.: link "Ver todas"). */
  right?: React.ReactNode;   // elemento opcional alinhado à direita
  style?: StyleProp<ViewStyle>; // estilos extras (opcional)
};

// Cabeçalho reutilizável para separar seções de uma tela (título + ação à direita).
export default function SectionHeader({ title, right, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {/* accessibilityRole="header" marca o texto como cabeçalho p/ leitores de tela */}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {right ? <View>{right}</View> : null}{/* mostra o conteúdo da direita só se existir */}
    </View>
  );
}

// Estilos.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',              // título e ação na mesma linha
    alignItems: 'center',             // alinhados verticalmente
    justifyContent: 'space-between',  // título à esquerda, ação à direita
    marginBottom: theme.spacing.md,   // espaço abaixo do cabeçalho
    marginTop: theme.spacing.lg,      // espaço acima do cabeçalho
  },
  title: {
    ...theme.font.title,              // tipografia de título
    color: theme.colors.textPrimary, // cor branca
  },
});
