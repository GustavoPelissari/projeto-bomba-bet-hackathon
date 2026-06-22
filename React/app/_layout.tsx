import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../constants/theme';
import { AuthProvider } from '../contexts/AuthContext';
import { IntroVideo } from '../components/IntroVideo';

// Layout raiz (expo-router): envolve todas as telas com o AuthProvider e exibe a intro.
export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      {showIntro ? (
        <IntroVideo onFinish={() => setShowIntro(false)} />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg },
            animation: 'slide_from_right',
          }}
        />
      )}
    </AuthProvider>
  );
}
