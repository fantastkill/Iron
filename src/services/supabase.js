import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Somente a chave pública é aceita. Service role nunca deve entrar no bundle.
function publicKey(value) {
  if (value?.startsWith('sb_publishable_')) return true;
  try {
    return JSON.parse(atob(value.split('.')[1])).role === 'anon';
  } catch {
    return false;
  }
}
export const configured = Boolean(url && /^https:\/\//.test(url) && publicKey(key));
export const supabase = configured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;
export const callbackUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`;

// O fragmento de tokens do Supabase e o HashRouter não devem disputar a URL.
// Convites usam token_hash (template documentado); confirmação/recuperação usam PKCE.
export async function finishAuthRedirect(client) {
  const url = new URL(window.location.href);
  const type = url.searchParams.get('type');
  const tokenHash = url.searchParams.get('token_hash');
  const code = url.searchParams.get('code');
  const providerError = url.searchParams.has('error');
  if (!code && !tokenHash && !providerError) return { recovery: false };
  try {
    if (providerError)
      throw new Error('Link de autenticação inválido ou expirado. Solicite um novo link.');
    if (tokenHash && type !== 'invite') throw new Error('Tipo de link de autenticação inválido.');
    const result = tokenHash
      ? await client.auth.verifyOtp({ token_hash: tokenHash, type: 'invite' })
      : await client.auth.exchangeCodeForSession(code);
    if (result.error) throw result.error;
    return { recovery: type === 'recovery' || type === 'invite' };
  } finally {
    // Remove o código de uso único e não o repassa ao roteador ou a logs.
    window.history.replaceState({}, '', `${url.pathname}#/login`);
  }
}
