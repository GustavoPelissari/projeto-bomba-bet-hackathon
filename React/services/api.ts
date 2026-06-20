/**
 * Cliente HTTP central — conecta o React (Expo) com a API Java (Spring Boot).
 *
 * Endereço da API:
 *  - Emulador Android: 10.0.2.2 é o "localhost" da sua máquina (NÃO use localhost,
 *    pois no emulador localhost é o próprio celular virtual).
 *  - Celular físico (Expo Go): troque para o IP da sua máquina na rede, ex.:
 *    EXPO_PUBLIC_API_URL=http://192.168.5.37:8080/api
 *  - Web (expo start --web): use http://localhost:8080/api (e habilite CORS no backend).
 *
 * Você pode sobrescrever a URL criando um arquivo .env com:
 *   EXPO_PUBLIC_API_URL=http://SEU_IP:8080/api
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave do token JWT no armazenamento do dispositivo (mesma usada no AuthContext).
export const TOKEN_KEY = '@bombabet:token';

// URL base da API. Usa a variável de ambiente se existir; senão, o emulador Android.
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';

// Função central que faz a requisição, adiciona o token e trata erros.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY); // pega o JWT salvo (se houver)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
    // Só adiciona o cabeçalho Authorization quando há token.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Se a resposta não for 2xx, tenta extrair a mensagem de erro do corpo.
  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      message = data?.message ?? data?.error ?? message;
    } catch {
      // corpo não era JSON — mantém a mensagem padrão
    }
    throw new Error(message);
  }

  // 204 (No Content) ou corpo vazio -> não há JSON para ler.
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// Atalhos para os verbos HTTP usados pelos serviços.
export const apiGet = <T>(path: string) => request<T>(path, { method: 'GET' });

export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) });

export const apiDelete = <T>(path: string) =>
  request<T>(path, { method: 'DELETE' });
