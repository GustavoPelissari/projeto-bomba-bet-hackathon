import { Redirect, Tabs } from 'expo-router';     // Redirect: redireciona rota; Tabs: navegação por abas
import { Ionicons } from '@expo/vector-icons';     // ícones das abas
import { theme } from '../../constants/theme';     // tokens de design
import { useAuth } from '../../contexts/AuthContext'; // hook de autenticação

// Layout do grupo de abas (a área logada do app: Início, Partidas, etc.).
export default function TabsLayout() {
  const { user, loading } = useAuth(); // lê o usuário logado e o estado de carregamento

  // gate de autenticação: enquanto carrega a sessão, não redireciona;
  // sem usuário, volta para o login.
  // (Só redireciona depois que terminou de carregar E não há usuário.)
  if (!loading && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,                                 // sem cabeçalho padrão
        tabBarActiveTintColor: theme.colors.accent,         // cor da aba ativa (dourado)
        tabBarInactiveTintColor: theme.colors.textSecondary,// cor das abas inativas (cinza)
        tabBarStyle: {                                      // aparência da barra de abas
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {                                 // aparência do texto das abas
          fontSize: theme.font.caption.fontSize,
          fontWeight: '600',
        },
      }}
    >
      {/* Aba Início. name="index" -> arquivo (tabs)/index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',                          // texto exibido na aba
          tabBarAccessibilityLabel: 'Início',       // rótulo p/ leitor de tela
          tabBarIcon: ({ color, size }) => (        // ícone (recebe cor/tamanho do sistema)
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      {/* Aba Partidas */}
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Partidas',
          tabBarAccessibilityLabel: 'Partidas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size} color={color} />
          ),
        }}
      />
      {/* Aba Palpites */}
      <Tabs.Screen
        name="predictions"
        options={{
          title: 'Palpites',
          tabBarAccessibilityLabel: 'Meus palpites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          ),
        }}
      />
      {/* Aba Ranking */}
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarAccessibilityLabel: 'Ranking',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      {/* Aba Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
