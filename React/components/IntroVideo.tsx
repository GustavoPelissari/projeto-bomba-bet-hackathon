import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { theme } from '../constants/theme';

const INTRO_SOURCE = require('../assets/Intro-bombaBet.mp4');

type Props = { onFinish: () => void };

// Reproduz o vídeo de abertura e chama onFinish quando ele termina.
export function IntroVideo({ onFinish }: Props) {
  const player = useVideoPlayer(INTRO_SOURCE, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      onFinish();
    });
    return () => sub.remove();
  }, [player, onFinish]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '80%',
    aspectRatio: 1,
  },
});
