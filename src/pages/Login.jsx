import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Dumbbell } from 'lucide-react';
import { Logo } from '../components/Layout';
import { Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
export default function Login() {
  const { user, loading, authError, configured, api, callbackUrl, recovery, setRecovery, logout } =
    useApp();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.has('cadastro') ? 'register' : 'login');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmation: '',
    plan: ['Smart', 'Fit', 'Black'].includes(params.get('plano')) ? params.get('plano') : 'Fit',
  });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const current = recovery ? 'password' : mode;
  useEffect(() => {
    if (user && !loading && !recovery) nav(`/${user.role}`, { replace: true });
  }, [user, loading, recovery, nav]);
  const switchMode = (value) => {
    setMode(value);
    setError('');
    setMessage('');
    setForm((f) => ({ ...f, password: '', confirmation: '' }));
  };
  async function submit(e) {
    e.preventDefault();
    if (!configured || pending) return;
    setError('');
    setMessage('');
    setPending(true);
    try {
      if (current === 'register') {
        await api.signUp({ ...form, role: 'aluno' }, callbackUrl());
        setMode('login');
        setMessage(
          'Cadastro enviado. Confirme o e-mail se solicitado pelo provedor e entre com sua senha.',
        );
      } else if (current === 'recover') {
        await api.recover(form.email, callbackUrl());
        setMessage(
          'Se houver uma conta para este e-mail, você receberá as instruções de recuperação.',
        );
      } else if (current === 'password') {
        if (form.password !== form.confirmation) throw new Error('As senhas não coincidem.');
        await api.password(form.password);
        if (!(await logout()))
          throw new Error(
            'Senha alterada, mas não foi possível sair. Tente novamente usando Sair da conta.',
          );
        setRecovery(false);
        setMode('login');
        setMessage('Senha definida. Entre com seu e-mail e a nova senha.');
      } else {
        await api.signIn(form.email, form.password);
      }
      setForm((f) => ({ ...f, password: '', confirmation: '' }));
    } catch (err) {
      const text = err.message || '';
      setError(
        /invalid login credentials|invalid_credentials/i.test(text)
          ? 'E-mail ou senha incorretos.'
          : /email not confirmed/i.test(text)
            ? 'Confirme seu e-mail antes de entrar.'
            : /already registered|already been registered/i.test(text)
              ? 'E-mail já cadastrado. Entre ou recupere sua senha.'
              : text || 'Não foi possível concluir. Tente novamente.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Logo />
        <div>
          <span className="eyebrow">DISCIPLINA QUE TRANSFORMA</span>
          <h1>
            SUA MELHOR
            <br />
            VERSÃO ESTÁ
            <br />
            <em>EM CONSTRUÇÃO.</em>
          </h1>
          <p>
            Treine com propósito.
            <br />
            Acompanhe cada conquista.
          </p>
          <Dumbbell size={110} strokeWidth={1} />
        </div>
        <small>IRON PULSE GYM • Projeto acadêmico</small>
      </section>
      <section className="login-panel">
        <Link className="text-link" to="/">
          ← Voltar para a academia
        </Link>
        <div className="login-form">
          <span className="eyebrow">BEM-VINDO À IRON PULSE</span>
          <h2>
            {current === 'register'
              ? 'Comece sua jornada.'
              : current === 'recover'
                ? 'Recupere seu acesso.'
                : current === 'password'
                  ? 'Defina sua senha.'
                  : 'Bom ter você de volta.'}
          </h2>
          <p className="muted">Seu próximo nível está a um passo.</p>
          {!recovery && (
            <div className="tabs">
              <button
                className={mode === 'login' ? 'active' : ''}
                onClick={() => switchMode('login')}
              >
                Entrar
              </button>
              <button
                className={mode === 'register' ? 'active' : ''}
                onClick={() => switchMode('register')}
              >
                Criar conta de aluno
              </button>
            </div>
          )}
          {!configured && (
            <p className="info" role="alert">
              O acesso ainda não está disponível. A administração precisa configurar o serviço de
              autenticação.
            </p>
          )}
          {loading && <p role="status">Verificando sua sessão…</p>}
          <form onSubmit={submit}>
            {current === 'register' && (
              <>
                <Input
                  label="Nome completo"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={change}
                />
                <p className="small muted">
                  Tipo de conta: Aluno. Professores recebem convite da administração.
                </p>
              </>
            )}
            {current !== 'password' && (
              <Input
                label="E-mail"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={change}
              />
            )}
            {current !== 'recover' && (
              <div className="password-field">
                <Input
                  label="Senha"
                  name="password"
                  type={show ? 'text' : 'password'}
                  autoComplete={current === 'login' ? 'current-password' : 'new-password'}
                  minLength={current === 'login' ? 1 : 8}
                  required
                  value={form.password}
                  onChange={change}
                />
                <button
                  type="button"
                  aria-label={show ? 'Ocultar senha' : 'Exibir senha'}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            )}
            {['register', 'password'].includes(current) && (
              <Input
                label="Confirme a senha"
                name="confirmation"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.confirmation}
                onChange={change}
              />
            )}
            {current === 'register' && (
              <label className="field">
                Plano
                <select aria-label="Plano" name="plan" value={form.plan} onChange={change}>
                  {['Smart', 'Fit', 'Black'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            )}
            {(error || authError) && (
              <p className="error" role="alert">
                {error || authError}
              </p>
            )}
            {message && (
              <p className="success" role="status">
                {message}
              </p>
            )}
            <Button type="submit" disabled={!configured || pending || loading}>
              {pending
                ? 'Aguarde…'
                : current === 'register'
                  ? 'Criar conta'
                  : current === 'recover'
                    ? 'Enviar recuperação'
                    : current === 'password'
                      ? 'Salvar senha'
                      : 'Entrar na minha conta'}
              <ArrowRight size={18} />
            </Button>
            {current === 'login' && (
              <button
                className="text-link recovery"
                type="button"
                onClick={() => switchMode('recover')}
              >
                Esqueci minha senha
              </button>
            )}
            {current === 'recover' && (
              <button
                className="text-link recovery"
                type="button"
                onClick={() => switchMode('login')}
              >
                Voltar ao login
              </button>
            )}
          </form>
          {recovery && (
            <button className="text-link recovery" onClick={logout}>
              Sair da conta
            </button>
          )}
          <p className="security-note">
            <ShieldCheck size={19} />
            Acesso com e-mail e senha. Contas de professor exigem convite; a administração é
            provisionada fora do cadastro público. Os planos são acadêmicos e não geram cobrança.
          </p>
        </div>
      </section>
    </main>
  );
}
