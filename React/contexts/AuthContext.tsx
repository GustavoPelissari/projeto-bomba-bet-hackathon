// Importa o React e os "hooks" usados para gerenciar estado e contexto.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPost, TOKEN_KEY } from '../services/api';
import type { UserProfile } from '../types/domain';

// ---- Formatos crus vindos da API ----
type LoginResponse = { token: string; tipo: string; nome: string; email: string };
type UsuarioDto = {
  id: number;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  pontuacaoTotal: number | null;
  placaresExatos: number | null;
};

// Funções/dados que o contexto expõe para o app.
type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Converte o usuário cru da API no perfil do app.
function toProfile(u: UsuarioDto): UserProfile {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    avatar: u.fotoPerfil ?? null,
    totalPoints: u.pontuacaoTotal ?? 0,
    rankingPosition: 0, // a posição é calculada nas telas de ranking/perfil
    exactScores: u.placaresExatos ?? 0,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // O app começa SEMPRE deslogado (cai na tela de login).
  useEffect(() => {
    setLoading(false);

    // Para manter o usuário logado entre aberturas, troque o setLoading(false)
    // acima por algo que leia o token e chame /usuarios/me para restaurar a sessão.
  }, []);

  // Faz login: POST /api/auth/login -> guarda o token -> busca o perfil em /me.
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<LoginResponse>('/auth/login', { email, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.token); // salva o JWT (o api.ts passa a usá-lo)
    setToken(res.token);

    // Com o token salvo, busca o perfil completo do usuário logado.
    const me = await apiGet<UsuarioDto>('/usuarios/me');
    setUser(toProfile(me));
  }, []);

  // Cadastra: POST /api/auth/cadastro -> em seguida faz login automaticamente.
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiPost('/auth/cadastro', { nome: name, email, password });
      await login(email, password);
    },
    [login]
  );

  // Logout: apaga o token e limpa o estado.
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para consumir o contexto com segurança.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
