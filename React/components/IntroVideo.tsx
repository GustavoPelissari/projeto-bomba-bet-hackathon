// Tela de introdução: reproduz o vídeo de abertura toda vez que o app inicia.
import { useEffect } from 'react';                       // efeito p/ ouvir o fim do vídeo
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';  // player de vídeo do Expo
import { theme } from '../constants/theme';              // tokens de design

// Arquivo do vídeo embutido no bundle do app.
const INTRO_SOURCE = require('../assets/Intro-bombaBet.mp4');

// Props: chamado quando o vídeo termina (ou quando o usuário pula).
type Props = { onFinish: () => void };

export function IntroVideo({ onFinish }: Props) {
  // Cria o player. O callback inicial configura e dá play assim que o vídeo carrega.
  const player = useVideoPlayer(INTRO_SOURCE, (p) => {
    p.loop = false;   // não repetir — toca uma vez e termina
    p.muted = false;  // com áudio (troque para true se quiser mudo)
    p.play();         // inicia a reprodução automaticamente
  });

  // Ouve o evento de "fim do vídeo" para avançar para o app.
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      onFinish(); // vídeo chegou ao fim -> segue para o app (tela de login)
    });
    return () => sub.remove(); // limpa o listener ao desmontar
  }, [player, onFinish]);

  return (
    <View style={styles.container}>
      <VideoView
        style={StyleSheet.absoluteFill} // vídeo ocupa a tela inteira
        player={player}
        contentFit="contain"            // mostra o vídeo inteiro, sem cortar
        nativeControls={false}          // sem controles de player
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg, // fundo escuro nas bordas do vídeo
  },
});
