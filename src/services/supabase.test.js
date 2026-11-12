import { describe, it, expect, vi, afterEach } from 'vitest';
import { finishAuthRedirect, configured } from './supabase';
afterEach(() => window.history.replaceState({}, '', '/'));
describe('Retorno do provedor com HashRouter (contrato, sem rede)', () => {
  it('não inventa configuração quando variáveis estão ausentes', () =>
    expect(configured).toBe(false));
  it('troca código PKCE antes de entregar a URL ao roteador', async () => {
    window.history.replaceState({}, '', '/Iron/?code=once&type=recovery');
    const client = { auth: { exchangeCodeForSession: vi.fn(async () => ({ error: null })) } };
    const result = await finishAuthRedirect(client);
    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith('once');
    expect(result.recovery).toBe(true);
    expect(location.search).toBe('');
    expect(location.hash).toBe('#/login');
  });
  it('convite valida token_hash e abre definição de senha', async () => {
    window.history.replaceState({}, '', '/Iron/?token_hash=once&type=invite');
    const client = { auth: { verifyOtp: vi.fn(async () => ({ error: null })) } };
    const result = await finishAuthRedirect(client);
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'once', type: 'invite' });
    expect(result.recovery).toBe(true);
  });
  it('recusa tipo indevido e limpa código inclusive em erro', async () => {
    window.history.replaceState({}, '', '/Iron/?token_hash=once&type=admin');
    await expect(finishAuthRedirect({ auth: {} })).rejects.toThrow('Tipo de link');
    expect(location.search).toBe('');
  });
  it('mostra erro de link expirado sem reutilizar o código na URL', async () => {
    window.history.replaceState({}, '', '/Iron/?code=expired');
    await expect(
      finishAuthRedirect({
        auth: { exchangeCodeForSession: async () => ({ error: new Error('Expirado') }) },
      }),
    ).rejects.toThrow('Expirado');
    expect(location.search).toBe('');
  });
});
