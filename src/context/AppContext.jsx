import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, callbackUrl, finishAuthRedirect } from '../services/supabase';
import { createApi, emptyData } from '../services/api';
const Context = createContext();
const redirects = new WeakMap();
export function AppProvider({ children, client = supabase }) {
  const api = useMemo(() => (client ? createApi(client) : null), [client]);
  const [data, setData] = useState(emptyData);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [authError, setAuthError] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [authReturn, setAuthReturn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('code') || params.has('token_hash') || params.has('error');
  });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const identity = useRef(null);
  const mutationLock = useRef(false);
  // Nenhuma credencial ou papel é lido do antigo localStorage demonstrativo.
  // O SDK administra a sessão; perfil e permissões vêm do banco protegido por RLS.
  useEffect(() => {
    if (!client) return;
    let disposed = false;
    let version = 0;
    async function sync(session) {
      const current = ++version;
      const id = session?.user?.id || null;
      identity.current = id;
      setLoading(true);
      setUser(null);
      setData(emptyData());
      setAuthError('');
      if (!id) {
        if (!disposed) setLoading(false);
        return;
      }
      try {
        const verified = await client.auth.getUser();
        if (verified.error || verified.data.user?.id !== id)
          throw new Error('Sessão inválida. Entre novamente.');
        const profile = await api.profile(id);
        if (!profile.passwordReady) setRecovery(true);
        if (!['admin', 'professor', 'aluno'].includes(profile.role) || !profile.active)
          throw new Error('Conta inativa ou sem perfil autorizado. Contate a administração.');
        const records = await api.load();
        if (!disposed && current === version) {
          setUser(profile);
          setData(records);
        }
      } catch (err) {
        if (!disposed && current === version)
          setAuthError(err.message || 'Não foi possível carregar seu perfil.');
      } finally {
        if (!disposed && current === version) setLoading(false);
      }
    }
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      // Evita chamadas Auth reentrantes dentro do callback do SDK.
      setTimeout(() => {
        if (!disposed) void sync(session);
      }, 0);
    });
    async function initialize() {
      try {
        if (!redirects.has(client)) redirects.set(client, finishAuthRedirect(client));
        const result = await redirects.get(client);
        if (disposed) return;
        if (result.recovery) setRecovery(true);
        const session = await client.auth.getSession();
        if (session.error) throw session.error;
        if (!disposed) await sync(session.data.session);
      } catch (err) {
        if (!disposed) {
          setLoading(false);
          setAuthError(err.message || 'Link de acesso inválido ou expirado.');
        }
      }
    }
    void initialize();
    return () => {
      disposed = true;
      version++;
      listener.subscription.unsubscribe();
    };
  }, [client, api]);
  useEffect(() => {
    if (!user || !api) return;
    let active = true;
    const refresh = async () => {
      try {
        const next = await api.load();
        if (active && identity.current === user.id) setData(next);
      } catch {
        if (active) setNotice('Não foi possível atualizar os dados. Verifique sua conexão.');
      }
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [user, api]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  async function mutate(task, success) {
    if (!api || mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    const current = identity.current;
    try {
      await task(api);
      const next = await api.load();
      if (identity.current === current) setData(next);
      if (success) setNotice(success);
      return true;
    } catch (err) {
      setNotice(err.message || 'Operação não concluída. Tente novamente.');
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api.signOut();
      identity.current = null;
      setUser(null);
      setData(emptyData());
      setRecovery(false);
      return true;
    } catch {
      setNotice('Não foi possível encerrar a sessão. Verifique sua conexão e tente novamente.');
      return false;
    }
  }
  return (
    <Context.Provider
      value={{
        data,
        user,
        loading,
        authError,
        recovery,
        setRecovery,
        authReturn,
        setAuthReturn,
        configured: Boolean(client),
        api,
        callbackUrl,
        busy,
        mutate,
        logout,
        notify: setNotice,
      }}
    >
      {children}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
