import { Redirect, Tabs } from 'expo-router';     // Redirect: protege rota; Tabs: navegação por abas
import { Ionicons } from '@expo/vector-icons';     // ícones das abas
import { theme } from '../../constants/theme';     // tokens de design
import { useAuth } from '../../contexts/AuthContext'; // hook de autenticação

// Layout do grupo de ABAS (a área logada do app).
// Toda tela .tsx criada dentro de app/(tabs)/ vira uma aba aqui.
export default function TabsLayout() {
  const { user, loading } = useAuth(); // usuário logado + se ainda está carregando a sessão

  // Enquanto verifica a sessão, não mostra nada (evita "piscar" as abas).
  if (loading) {
    return null;
  }

  // Proteção: se NÃO há usuário logado, volta para o login.
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,                                  // sem cabeçalho padrão
        tabBarActiveTintColor: theme.colors.accent,          // cor da aba ativa (dourado)
        tabBarInactiveTintColor: theme.colors.textSecondary, // cor das abas inativas
        tabBarStyle: {                                       // visual da barra de abas
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.font.caption.fontSize,
          fontWeight: '600',
        },
      }}
    >
      {/* Aba Início -> arquivo app/(tabs)/index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      {/*
        COMO ADICIONAR UMA NOVA ABA (ex.: Partidas):
        1) Crie o arquivo app/(tabs)/matches.tsx com o conteúdo da tela.
        2) Adicione aqui:
           <Tabs.Screen
             name="matches"
             options={{
               title: 'Partidas',
               tabBarIcon: ({ color, size }) => (
                 <Ionicons name="football" size={size} color={color} />
               ),
             }}
           />
      */}
    </Tabs>
  );
}
