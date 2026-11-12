import React from 'react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute, Layout } from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Professor from './pages/Professor';
import Student from './pages/Student';
import Evolution from './pages/Evolution';
import { createApi } from './services/api';
import { AuthReturn } from './components/AuthReturn';
import { finishAuthRedirect } from './services/supabase';
vi.mock('./services/supabase', () => ({
  supabase: null,
  callbackUrl: () => 'http://localhost/Iron/',
  finishAuthRedirect: vi.fn(async () => ({ recovery: false })),
}));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: () => null,
  LineChart: () => null,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));
const person = (id, role, extra = {}) => ({
  id,
  name: 'Nome ' + id,
  email: `${id}@test.local`,
  role,
  plan: 'Fit',
  teacher_id: null,
  active: true,
  ...extra,
});
function mockClient(profile = null, records = {}) {
  let session = profile ? { user: { id: profile.id } } : null;
  let handler = () => {};
  const rows = {
    profiles: profile ? [profile] : [],
    plans: [],
    workouts: [],
    workout_progress: [],
    workout_history: [],
    measurements: [],
    invitations: [],
    ...records,
  };
  const auth = {
    getSession: vi.fn(async () => ({ data: { session }, error: null })),
    getUser: vi.fn(async () => ({ data: { user: session?.user }, error: null })),
    onAuthStateChange: vi.fn((cb) => {
      handler = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    signInWithPassword: vi.fn(async () => ({
      data: {},
      error: { message: 'Invalid login credentials' },
    })),
    signUp: vi.fn(async () => ({
      data: { user: { identities: [{}] }, session: null },
      error: null,
    })),
    signOut: vi.fn(async () => {
      session = null;
      handler('SIGNED_OUT', null);
      return { error: null };
    }),
    resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
    updateUser: vi.fn(async () => ({ data: { user: {} }, error: null })),
  };
  const client = {
    auth,
    from: vi.fn((table) => {
      let id;
      const query = {
        select: () => query,
        eq: (_key, value) => {
          id = value;
          return query;
        },
        single: async () => ({ data: rows[table].find((p) => p.id === id), error: null }),
        then: (resolve, reject) =>
          Promise.resolve({ data: rows[table], error: null }).then(resolve, reject),
        upsert: vi.fn(async () => ({ error: null })),
        delete: () => ({ eq: vi.fn(async () => ({ error: null })) }),
      };
      return query;
    }),
    rpc: vi.fn(async () => ({ data: [], error: null })),
    functions: { invoke: vi.fn(async () => ({ data: { success: true }, error: null })) },
    emit(event, next) {
      session = next;
      handler(event, next);
    },
  };
  return client;
}
function mount(Page, client = null, path = '/login', minimalHome = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider client={client}>
        <AuthReturn />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={minimalHome ? <p>Home pública</p> : <Home />} />
          <Route element={<ProtectedRoute roles={['aluno']} />}>
            <Route element={<Layout />}>
              <Route path="/aluno" element={Page ? <Page /> : <p>Painel aluno</p>} />
              <Route path="/evolucao" element={<Evolution />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<p>Painel admin</p>} />
          </Route>
          <Route element={<ProtectedRoute roles={['professor']} />}>
            <Route path="/professor" element={Page ? <Page /> : <p>Painel professor</p>} />
          </Route>
        </Routes>
      </AppProvider>
    </MemoryRouter>,
  );
}
const fill = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});
describe('Interface e contratos de autenticação (SDK mockado; não substitui integração)', () => {
  it('retorno por query navega pelo HashRouter após validar o perfil', async () => {
    window.history.replaceState({}, '', '/Iron/?code=one-time');
    mount(null, mockClient(person('s', 'aluno')), '/', true);
    expect(await screen.findByText('Painel aluno')).toBeTruthy();
  });
  it('retorno de convite exige definir senha e sair antes do login', async () => {
    window.history.replaceState({}, '', '/Iron/?token_hash=one-time&type=invite');
    finishAuthRedirect.mockResolvedValueOnce({ recovery: true });
    const c = mockClient(person('s', 'aluno'));
    mount(null, c, '/', true);
    expect(await screen.findByText('Defina sua senha.')).toBeTruthy();
    fill('Senha', 'NovaSenha123!');
    fill('Confirme a senha', 'NovaSenha123!');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar senha' }));
    await waitFor(() =>
      expect(c.auth.updateUser).toHaveBeenCalledWith({ password: 'NovaSenha123!' }),
    );
    await waitFor(() => expect(c.auth.signOut).toHaveBeenCalled());
    expect(
      await screen.findByText('Senha definida. Entre com seu e-mail e a nova senha.'),
    ).toBeTruthy();
  });
  it('refresh de convidado sem senha não libera o painel', async () => {
    mount(null, mockClient(person('t', 'professor', { password_ready: false })), '/professor');
    expect(await screen.findByText('Defina sua senha.')).toBeTruthy();
    expect(screen.queryByText('Painel professor')).toBeNull();
  });
  it('bloqueia acesso sem configuração e remove acessos automáticos', () => {
    mount();
    expect(screen.getByRole('button', { name: 'Entrar na minha conta' }).disabled).toBe(true);
    expect(screen.queryByText('EXPERIMENTE SEM CADASTRO')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Administrador' })).toBeNull();
    expect(screen.queryByText(/visitante/i)).toBeNull();
  });
  it('ignora a antiga sessão manipulada no localStorage', () => {
    localStorage.setItem('iron-session', JSON.stringify({ role: 'admin' }));
    mount(null, null, '/admin');
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
  });
  it('preserva o plano da Home ao abrir cadastro', () => {
    mount(null, null, '/');
    fireEvent.click(screen.getByRole('link', { name: 'Escolher Black' }));
    expect(screen.getByLabelText('Plano').value).toBe('Black');
    expect(screen.getByText(/Tipo de conta: Aluno/)).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Administrador' })).toBeNull();
  });
  it('envia cadastro de aluno e não persiste senha', async () => {
    const c = mockClient();
    mount(null, c, '/login?cadastro=1&plano=Black');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar conta' }).disabled).toBe(false),
    );
    fill('Nome completo', 'Maria Silva');
    fill('E-mail', 'maria@test.local');
    fill('Senha', 'SenhaTeste123!');
    fill('Confirme a senha', 'SenhaTeste123!');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(c.auth.signUp).toHaveBeenCalled());
    expect(c.auth.signUp.mock.calls[0][0].options.data).toEqual({
      name: 'Maria Silva',
      plan: 'Black',
    });
    expect(localStorage.length).toBe(0);
    expect(await screen.findByText(/Cadastro enviado/)).toBeTruthy();
  });
  it('rejeita confirmação divergente', async () => {
    const c = mockClient();
    mount(null, c, '/login?cadastro=1');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar conta' }).disabled).toBe(false),
    );
    fill('Nome completo', 'Maria');
    fill('E-mail', 'maria@test.local');
    fill('Senha', 'SenhaTeste123!');
    fill('Confirme a senha', 'outra123');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('As senhas não coincidem.')).toBeTruthy();
    expect(c.auth.signUp).not.toHaveBeenCalled();
  });
  it('rejeita e-mail duplicado retornado pelo provedor', async () => {
    const c = mockClient();
    c.auth.signUp.mockResolvedValue({ data: { user: { identities: [] } }, error: null });
    await expect(
      createApi(c).signUp(
        {
          name: 'Maria',
          email: 'maria@test.local',
          password: 'SenhaTeste123!',
          confirmation: 'SenhaTeste123!',
          plan: 'Fit',
        },
        'http://localhost',
      ),
    ).rejects.toThrow('E-mail já cadastrado');
  });
  it.each(['admin', 'professor'])('impede cadastro público de %s no serviço', async (role) => {
    const c = mockClient();
    await expect(
      createApi(c).signUp(
        {
          role,
          name: 'Maria',
          email: 'a@test.local',
          password: 'SenhaTeste123!',
          confirmation: 'SenhaTeste123!',
        },
        'http://localhost',
      ),
    ).rejects.toThrow('Somente alunos');
    expect(c.auth.signUp).not.toHaveBeenCalled();
  });
  it.each(['senha incorreta', 'conta inexistente'])('mostra erro do Auth para %s', async () => {
    const c = mockClient();
    mount(null, c);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Entrar na minha conta' }).disabled).toBe(false),
    );
    fill('E-mail', 'unknown@test.local');
    fill('Senha', 'Incorreta123!');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeTruthy();
    expect(c.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'unknown@test.local',
      password: 'Incorreta123!',
    });
  });
  it.each([
    ['aluno', 'Painel aluno'],
    ['professor', 'Painel professor'],
    ['admin', 'Painel admin'],
  ])('restaura sessão do SDK e redireciona %s', async (role, label) => {
    const c = mockClient(person('p', role));
    mount(null, c);
    expect(await screen.findByText(label)).toBeTruthy();
    expect(c.auth.getUser).toHaveBeenCalled();
  });
  it('redireciona aluno tentando rota administrativa', async () => {
    mount(null, mockClient(person('s', 'aluno')), '/admin');
    expect(await screen.findByText('Painel aluno')).toBeTruthy();
    expect(screen.queryByText('Painel admin')).toBeNull();
  });
  it('bloqueia usuário com perfil inativo', async () => {
    mount(null, mockClient(person('s', 'aluno', { active: false })));
    expect(await screen.findByText(/Conta inativa/)).toBeTruthy();
  });
  it('login válido aguarda perfil no banco', async () => {
    const p = person('a', 'admin');
    const c = mockClient(null, { profiles: [p] });
    c.auth.signInWithPassword.mockImplementation(async () => {
      c.emit('SIGNED_IN', { user: { id: p.id } });
      return { data: { session: { user: { id: p.id } } }, error: null };
    });
    mount(null, c);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Entrar na minha conta' }).disabled).toBe(false),
    );
    fill('E-mail', p.email);
    fill('Senha', 'SenhaTeste123!');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
    expect(await screen.findByText('Painel admin')).toBeTruthy();
  });
  it('logout chama o provedor e bloqueia o painel', async () => {
    const c = mockClient(person('s', 'aluno'));
    mount(null, c, '/aluno');
    fireEvent.click(await screen.findByRole('button', { name: 'Sair da conta' }));
    await waitFor(() => expect(c.auth.signOut).toHaveBeenCalled());
    expect(await screen.findByLabelText('E-mail')).toBeTruthy();
  });
  it('envia recuperação por e-mail com callback de recuperação', async () => {
    const c = mockClient();
    mount(null, c);
    fireEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Enviar recuperação' }).disabled).toBe(false),
    );
    fill('E-mail', 'user@test.local');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar recuperação' }));
    await waitFor(() =>
      expect(c.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@test.local', {
        redirectTo: 'http://localhost/Iron/?type=recovery',
      }),
    );
  });
  it('exibe somente alunos atribuídos no painel do professor', async () => {
    const p = person('t', 'professor');
    mount(
      Professor,
      mockClient(p, {
        profiles: [
          p,
          person('s1', 'aluno', { name: 'Aluno atribuído', teacher_id: 't' }),
          person('s2', 'aluno', { name: 'Aluno privado', teacher_id: 'other' }),
        ],
      }),
      '/professor',
    );
    expect(await screen.findByText('Aluno atribuído')).toBeTruthy();
    expect(screen.queryByText('Aluno privado')).toBeNull();
  });
  it('aluno não exibe medidas de outro usuário', async () => {
    const p = person('s', 'aluno');
    mount(
      null,
      mockClient(p, {
        measurements: [
          {
            id: 'm',
            student_id: 'other',
            date: '2026-11-12',
            weight: 123.4,
            waist: 80,
            chest: 100,
          },
        ],
      }),
      '/evolucao',
    );
    expect(await screen.findByText('Registro de medidas')).toBeTruthy();
    expect(screen.queryByText('123.4 kg')).toBeNull();
  });
  it('faz escrita de ficha e progresso pelas APIs do servidor', async () => {
    const c = mockClient();
    const api = createApi(c);
    await api.toggleExercise('w', 'e', '2026-11-12');
    expect(c.rpc).toHaveBeenCalledWith('toggle_exercise', {
      p_workout: 'w',
      p_exercise: 'e',
      p_date: '2026-11-12',
    });
    await api.saveWorkout({
      id: 'w',
      studentId: 's',
      title: 'Ficha',
      days: ['Seg'],
      exercises: [],
    });
    expect(c.from).toHaveBeenCalledWith('workouts');
  });
});
