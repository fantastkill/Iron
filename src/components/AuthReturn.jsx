import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Mudanças via history.replaceState limpam o código do provedor, mas não
// notificam o HashRouter. Navegue pelo próprio roteador após validar o retorno.
export function AuthReturn() {
  const { authReturn, setAuthReturn, loading, recovery, user } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authReturn || loading) return;
    navigate(recovery || !user ? '/login' : `/${user.role}`, { replace: true });
    setAuthReturn(false);
  }, [authReturn, setAuthReturn, loading, recovery, user, navigate]);
  return null;
}
