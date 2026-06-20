import React from 'react'; // necessário para JSX
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';       // ícones
import { theme } from '../constants/theme';          // tokens de design
import type { MatchStatus } from '../types/domain';  // tipo da situação da partida

// Formato da configuração visual de cada status.
type Config = {
  label: string;                          // texto exibido
  color: string;                          // cor do texto/ícone/borda
  icon: keyof typeof Ionicons.glyphMap;   // ícone correspondente
};

// Mapa que associa cada status (AGENDADA/AO VIVO/ENCERRADA) à sua aparência.
const CONFIG: Record<MatchStatus, Config> = {
  SCHEDULED: { label: 'Agendada', color: theme.colors.scheduled, icon: 'time-outline' },
  LIVE: { label: 'Ao vivo', color: theme.colors.live, icon: 'radio-outline' },
  FINISHED: { label: 'Encerrada', color: theme.colors.textSecondary, icon: 'checkmark-done-outline' },
};

// "Pílula" (etiqueta arredondada) que mostra a situação de uma partida.
export default function StatusPill({ status }: { status: MatchStatus }) {
  const cfg = CONFIG[status]; // pega a configuração visual conforme o status recebido
  return (
    <View
      style={[styles.pill, { borderColor: cfg.color }]} // borda colorida conforme o status
      accessible                                          // trata como um único elemento p/ acessibilidade
      accessibilityLabel={`Situação: ${cfg.label}`}       // texto lido pelo leitor de tela
    >
      <Ionicons name={cfg.icon} size={13} color={cfg.color} accessible={false} />{/* ícone do status */}
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>{/* texto do status */}
    </View>
  );
}

// Estilos.
const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',                     // ícone + texto lado a lado
    alignItems: 'center',                    // centralizados verticalmente
    gap: theme.spacing.xs,                   // espaço entre ícone e texto
    borderWidth: 1,                          // contorno
    borderRadius: theme.radius.full,         // totalmente arredondado (formato de pílula)
    paddingHorizontal: theme.spacing.md - 2, // espaço interno lateral
    paddingVertical: theme.spacing.xs,       // espaço interno em cima/baixo
    alignSelf: 'flex-start',                 // a pílula ocupa só a largura do conteúdo
  },
  text: {
    ...theme.font.caption,                   // tipografia pequena
    fontWeight: '600',                       // semi-negrito
  },
});
