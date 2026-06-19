// Importa o React e os "hooks" usados para gerenciar estado e contexto.
import React, {
  createContext, // cria um Contexto (forma de compartilhar dados sem passar props)
  useCallback,   // memoriza funções para não recriá-las a cada render
  useContext,    // lê o valor de um contexto
  useEffect,     // executa efeitos colaterais (ex.: ao montar o componente)
  useMemo,       // memoriza valores calculados para evitar recomputações
  useState,      // cria estado local reativo
} from 'react';
// Armazenamento persistente no dispositivo (como o localStorage, mas p/ mobile).
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipo do perfil do usuário (antes vinha de types/domain.ts).
type UserProfile = {
  id: number;     // identificador do usuário
  name: string;   // nome
  email: string;  // e-mail
};

// Usuário falso usado enquanto não há backend (antes vinha de mocks/user.ts).
const MOCK_USER: UserProfile = {
  id: 777,
  name: 'Eduardo Malaquias',
  email: 'edu.vergentino.malaquias@gmail.com',
};

// Chave usada para salvar/ler o token no AsyncStorage.
const TOKEN_KEY = '@bombabet:token';

// Formato (tipo) dos dados e funções que o contexto de autenticação expõe.
type AuthContextValue = {
  user: UserProfile | null;  // usuário logado, ou null se ninguém logado
  token: string | null;      // token de sessão, ou null
  loading: boolean;          // true enquanto verifica se há sessão salva
  login: (email?: string, password?: string) => Promise<void>;  // faz login
  logout: () => Promise<void>; // faz logout
};

// Cria o contexto. Começa "undefined" para detectarmos uso fora do Provider.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Componente que ENVOLVE o app e fornece os dados de autenticação aos filhos.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado do token (string ou null).
  const [token, setToken] = useState<string | null>(null);
  // Estado do usuário logado (objeto ou null).
  const [user, setUser] = useState<UserProfile | null>(null);
  // Estado de carregamento inicial (começa true até checar o storage).
  const [loading, setLoading] = useState(true);

  // Ao iniciar, o app começa SEMPRE deslogado (cai na tela de login).
  // useEffect com lista de dependências vazia [] roda só UMA vez, ao montar.
  useEffect(() => {
    // DURANTE O DESENVOLVIMENTO: não restauramos a sessão, para sempre começar no login.
    // Apenas encerramos o "carregando".
    setLoading(false);

    // QUANDO QUISER MANTER O USUÁRIO LOGADO entre aberturas do app,
    // apague o setLoading(false) acima e descomente o bloco abaixo:
    //
    // (async () => {
    //   try {
    //     const saved = await AsyncStorage.getItem(TOKEN_KEY); // lê o token salvo
    //     if (saved) {
    //       setToken(saved);   // restaura o token
    //       setUser(MOCK_USER); // restaura o usuário
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // })();
  }, []);

  // Função de login. useCallback evita recriá-la a cada render.
  const login = useCallback(async (_email?: string, _password?: string) => {
    // TODO POST /auth/login -> receber token real
    // Por enquanto usa um token fixo de mentira (mock).
    const fakeToken = 'mock-token';
    await AsyncStorage.setItem(TOKEN_KEY, fakeToken); // salva o token no dispositivo
    setToken(fakeToken);  // atualiza o estado do token
    setUser(MOCK_USER);   // define o usuário logado (mock)
  }, []);

  // Função de logout.
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY); // apaga o token salvo
    setToken(null); // limpa o token do estado
    setUser(null);  // limpa o usuário do estado
  }, []);

  // Monta o objeto que será compartilhado. useMemo evita recriá-lo sem necessidade;
  // ele só muda quando uma das dependências listadas muda.
  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
  );

  // Fornece o "value" para toda a árvore de componentes filhos.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para consumir o contexto de autenticação de forma segura.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext); // pega o valor atual do contexto
  // Se for undefined, significa que foi usado fora do <AuthProvider> — erro de uso.
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx; // devolve os dados/funções de autenticação
}
