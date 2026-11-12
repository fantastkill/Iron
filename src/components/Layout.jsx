import React from 'react';
import { NavLink, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Users, Activity, LogOut, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
export const Logo = () => (
  <Link to="/" className="logo">
    <Dumbbell size={30} />
    <span>
      IRON PULSE<small>GYM & PERFORMANCE</small>
    </span>
  </Link>
);
export function Header() {
  const { user } = useApp();
  return (
    <header className="header">
      <Logo />
      <nav>
        <Link to="/?section=structure">A academia</Link>
        <Link to="/?section=plans">Planos</Link>
        <Link to="/?section=faq">Dúvidas</Link>
      </nav>
      <Link className="button" to={user ? `/${user.role}` : '/login'}>
        Área do aluno <ArrowUpRight size={16} />
      </Link>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <Logo />
      <p>Disciplina hoje. Sua melhor versão amanhã.</p>
      <small>
        Projeto acadêmico • Academia, preços e depoimentos fictícios • Sem pagamentos reais.
      </small>
      <p>Contato demonstrativo: contato@ironpulse.example • São Paulo, SP</p>
    </footer>
  );
}
export function ProtectedRoute({ roles }) {
  const { user, loading, recovery } = useApp();
  if (loading)
    return (
      <main className="dashboard" role="status">
        Verificando sua sessão…
      </main>
    );
  return !user || recovery ? (
    <Navigate to="/login" replace />
  ) : !roles.includes(user.role) ? (
    <Navigate to={`/${user.role}`} replace />
  ) : (
    <Outlet />
  );
}
export function Layout() {
  const { user, logout } = useApp();
  const { pathname } = useLocation();
  const links =
    user.role === 'admin'
      ? [['/admin', 'Visão geral', LayoutDashboard]]
      : user.role === 'professor'
        ? [['/professor', 'Meus alunos', Users]]
        : [
            ['/aluno', 'Meu treino', Dumbbell],
            ['/evolucao', 'Minha evolução', Activity],
          ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <span className="nav-caption">SEU ESPAÇO DE EVOLUÇÃO</span>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={pathname === to ? 'selected' : ''}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="demo-pill">ACESSO AUTENTICADO</span>
          <Link to="/">
            Conhecer a academia <ArrowUpRight size={16} />
          </Link>
          <button onClick={logout}>
            <LogOut size={17} />
            Sair da conta
          </button>
        </div>
      </aside>
      <div className="workspace">
        <div className="topbar">
          <span>
            IRON PULSE{' '}
            <b>
              /{' '}
              {user.role === 'admin' ? 'Gestão' : user.role === 'professor' ? 'Professor' : 'Aluno'}
            </b>
          </span>
          <div className="profile">
            <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
            <span>
              {user.name}
              <small>
                {user.role === 'admin'
                  ? 'Administrador'
                  : user.role === 'professor'
                    ? 'Professor'
                    : 'Aluno'}
              </small>
            </span>
          </div>
        </div>
        <main className="dashboard">
          <Outlet />
        </main>
        <div className="dashboard-footer">
          IRON PULSE GYM <span>Projeto acadêmico • Área privada</span>
        </div>
      </div>
    </div>
  );
}
