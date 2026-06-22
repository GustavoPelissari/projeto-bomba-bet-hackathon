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

type LoginResponse = { token: string; tipo: string; nome: string; email: string };
type UsuarioDto = {
  id: number;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  pontuacaoTotal: number | null;
  placaresExatos: number | null;
};

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toProfile(u: UsuarioDto): UserProfile {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    avatar: u.fotoPerfil ?? null,
    totalPoints: u.pontuacaoTotal ?? 0,
    rankingPosition: 0,
    exactScores: u.placaresExatos ?? 0,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // O app começa sempre deslogado (cai na tela de login).
  useEffect(() => {
    setLoading(false);
  }, []);

  // Login: guarda o token e busca o perfil completo em /usuarios/me.
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<LoginResponse>('/auth/login', { email, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);

    const me = await apiGet<UsuarioDto>('/usuarios/me');
    setUser(toProfile(me));
  }, []);

  // Cadastra e em seguida faz login automaticamente.
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiPost('/auth/cadastro', { nome: name, email, password });
      await login(email, password);
    },
    [login]
  );

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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
