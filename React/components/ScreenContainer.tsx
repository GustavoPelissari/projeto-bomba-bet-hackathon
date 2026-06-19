import React from 'react'; // necessário para JSX
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
// SafeAreaView evita que o conteúdo fique sob o notch/barra de status do celular.
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme'; // tokens de design

// Props do container de tela.
type Props = {
  children: React.ReactNode; // o conteúdo da tela (qualquer elemento React)
  /** Remove o padding horizontal/vertical padrão (útil para listas full-bleed). */
  noPadding?: boolean;       // se true, remove o espaçamento interno
  style?: StyleProp<ViewStyle>; // estilos extras (opcional)
};

// Componente que padroniza o "esqueleto" de todas as telas (fundo + área segura + padding).
export default function ScreenContainer({ children, noPadding, style }: Props) {
  return (
    // Respeita as áreas seguras no topo e nas laterais (não na base).
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.content, noPadding && styles.noPadding, style]}>
        {children}{/* renderiza o conteúdo passado pela tela */}
      </View>
    </SafeAreaView>
  );
}

// Estilos.
const styles = StyleSheet.create({
  safe: {
    flex: 1,                          // ocupa a tela inteira
    backgroundColor: theme.colors.bg, // fundo escuro padrão
  },
  content: {
    flex: 1,                          // ocupa todo o espaço dentro da área segura
    padding: theme.spacing.lg,        // espaçamento interno padrão
  },
  noPadding: {
    padding: 0,                       // sem espaçamento (sobrescreve o padrão)
  },
});
