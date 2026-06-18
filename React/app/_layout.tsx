import { useState } from 'react';                // estado p/ controlar a intro
import { Stack } from 'expo-router';            // navegação em "pilha" (telas empilhadas)
import { StatusBar } from 'expo-status-bar';     // controla a barra de status do sistema
import { theme } from '../constants/theme';      // tokens de design
import { AuthProvider } from '../contexts/AuthContext'; // provedor de autenticação
import { IntroVideo } from '../components/IntroVideo';   // vídeo de abertura

// Layout RAIZ do app (expo-router). Envolve TODAS as telas.
// O nome do arquivo "_layout" é uma convenção do expo-router.
export default function RootLayout() {
  // Controla se o vídeo de introdução ainda deve ser exibido.
  // Começa true -> a intro toca toda vez que o app inicia.
  const [showIntro, setShowIntro] = useState(true);

  return (
    // AuthProvider disponibiliza usuário/login/logout para o app inteiro.
    <AuthProvider>
      <StatusBar style="light" />{/* ícones/relógio da barra de status em branco (tema escuro) */}
      {/* Enquanto showIntro for true, exibimos o vídeo. Ao terminar,
          setShowIntro(false) libera a navegação normal (tela de login). */}
      {showIntro ? (
        <IntroVideo onFinish={() => setShowIntro(false)} />
      ) : (
        // As rotas são descobertas automaticamente pelos arquivos em app/.
        <Stack
          screenOptions={{
            headerShown: false,                                  // sem cabeçalho padrão (usamos o nosso)
            contentStyle: { backgroundColor: theme.colors.bg }, // fundo escuro em todas as telas
            animation: 'slide_from_right',                      // transição deslizando da direita
          }}
        />
      )}
    </AuthProvider>
  );
}
