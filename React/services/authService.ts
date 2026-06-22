import { apiPost } from './api';

// Solicita o token de recuperação de senha (em produção iria por e-mail).
export async function forgotPassword(email: string): Promise<string> {
  const res = await apiPost<{ token: string; mensagem: string }>(
    '/auth/forgot-password',
    { email }
  );
  return res.token;
}

// Redefine a senha usando o token recebido.
export async function resetPassword(
  token: string,
  novaSenha: string
): Promise<void> {
  await apiPost('/auth/reset-password', { token, novaSenha });
}
