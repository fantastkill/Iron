import React, { useState } from 'react';
import {
  Users,
  Dumbbell,
  GraduationCap,
  Activity,
  Plus,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { Button, Card, Input, Empty, PageTitle } from '../components/UI';
export default function Admin() {
  const { data, mutate, busy } = useApp();
  const [tab, setTab] = useState('students');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});
  const people = data[tab];
  const filtered = people.filter((p) =>
    `${p.name} ${p.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  function open(person) {
    setError('');
    setForm(
      person || {
        name: '',
        email: '',
        teacherId: data.teachers[0]?.id || '',
        plan: 'Fit',
        active: true,
      },
    );
    setEditing(person?.id || 'new');
  }
  async function save(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Informe um nome válido.');
    const success = await mutate(
      (api) =>
        editing === 'new'
          ? api.invite(form, tab === 'students' ? 'aluno' : 'professor')
          : api.savePerson(form),
      editing === 'new'
        ? 'Convite enviado. O usuário receberá instruções para definir a senha.'
        : 'Cadastro atualizado.',
    );
    if (success) setEditing(null);
  }
  async function remove(person) {
    if (!confirm('Excluir a conta de ' + person.name + ' e seus registros associados?')) return;
    await mutate((api) => api.deletePerson(person.id), 'Conta excluída.');
  }
  const chart = data.teachers.map((t) => ({
    name: t.name.split(' ')[0],
    alunos: data.students.filter((s) => s.teacherId === t.id).length,
  }));
  return (
    <>
      <PageTitle eyebrow="CONTROLE, CLAREZA E RESULTADOS" title="Visão geral">
        <span className="date-label">
          {new Date().toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </PageTitle>
      <p className="intro">
        Sua academia em movimento. Acompanhe os números e cuide de cada jornada.
      </p>
      <div className="grid four metrics">
        {[
          [Users, data.students.length, 'Alunos cadastrados'],
          [GraduationCap, data.teachers.length, 'Professores'],
          [Dumbbell, data.workouts.length, 'Fichas de treino'],
          [Activity, data.students.filter((s) => s.active).length, 'Alunos ativos'],
        ].map(([Icon, n, label]) => (
          <Card key={label}>
            <Icon />
            <strong>{n}</strong>
            <span>{label}</span>
            <small>Cadastros no banco</small>
          </Card>
        ))}
      </div>
      <div className="grid chart-row">
        <Card>
          <div className="card-heading">
            <h3>Alunos por professor</h3>
            <span className="badge">Distribuição atual</span>
          </div>
          {chart.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chart}>
                <XAxis dataKey="name" stroke="#929398" />
                <YAxis allowDecimals={false} stroke="#929398" />
                <Tooltip
                  contentStyle={{ background: '#232427', border: '1px solid #444', color: '#fff' }}
                />
                <Bar dataKey="alunos" fill="#ef3b3b" radius={[5, 5, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty>Nenhum professor cadastrado.</Empty>
          )}
        </Card>
        <Card className="activity-card">
          <span className="eyebrow">PULSO DA ACADEMIA</span>
          <h3>
            Todo progresso
            <br />
            começa com presença.
          </h3>
          <div className="activity-number">
            {data.history.length}
            <span>treinos registrados</span>
          </div>
          <p>{data.students.filter((s) => !s.teacherId).length} aluno(s) aguardando professor.</p>
          <p>
            {data.students.length
              ? Math.round(
                  (data.students.filter((s) => s.active).length / data.students.length) * 100,
                )
              : 0}
            % da base está ativa.
          </p>
        </Card>
      </div>
      <Card>
        <div className="card-heading">
          <div className="tabs compact">
            {[
              ['students', 'Alunos'],
              ['teachers', 'Professores'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={tab === key ? 'active' : ''}
                onClick={() => {
                  setTab(key);
                  setQuery('');
                  setEditing(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <Button disabled={busy} onClick={() => open()}>
            <Plus size={17} />
            Convidar {tab === 'students' ? 'aluno' : 'professor'}
          </Button>
        </div>
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Pesquisar cadastros"
            placeholder="Buscar por nome ou e-mail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome / E-mail</th>
                {tab === 'students' && (
                  <>
                    <th>Plano</th>
                    <th>Professor</th>
                    <th>Status</th>
                  </>
                )}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <small>{p.email}</small>
                  </td>
                  {tab === 'students' && (
                    <>
                      <td>
                        <span className="badge">{p.plan}</span>
                      </td>
                      <td>
                        {data.teachers.find((t) => t.id === p.teacherId)?.name || 'Não atribuído'}
                      </td>
                      <td>
                        <span className={`status ${p.active ? '' : 'inactive'}`}>
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </>
                  )}
                  <td>
                    <div className="row-actions">
                      <button aria-label={`Editar ${p.name}`} onClick={() => open(p)}>
                        <Pencil size={16} />
                      </button>
                      <button aria-label={`Excluir ${p.name}`} onClick={() => remove(p)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <Empty>Nenhum registro encontrado. Ajuste a pesquisa ou crie um cadastro.</Empty>
        )}
        <p className="table-caption">{filtered.length} registro(s) • Contas registradas</p>
      </Card>
      <Card className="form-actions">
        <h3>Planos acadêmicos</h3>
        <p className="muted small">
          Valores de referência, sem cobrança. Alterações aparecem na Home.
        </p>
        {data.plans.map((plan) => (
          <form
            className="plan-management"
            key={plan.name}
            onSubmit={async (e) => {
              e.preventDefault();
              const price = new FormData(e.currentTarget).get('price');
              await mutate((api) => api.savePlan({ ...plan, price }), 'Preço do plano atualizado.');
            }}
          >
            <b>{plan.name}</b>
            <Input
              label={`Preço ${plan.name} (R$)`}
              name="price"
              type="number"
              min="0"
              max="99999"
              step="0.01"
              defaultValue={plan.price}
              required
            />
            <Button disabled={busy}>Atualizar</Button>
          </form>
        ))}
        <h3>Convites pendentes</h3>
        {data.invitations.length ? (
          data.invitations.map((i) => (
            <p className="small" key={i.email}>
              {i.email} • {i.role}
            </p>
          ))
        ) : (
          <Empty>Sem convites pendentes. Contas convidadas já criadas aparecem nas listas.</Empty>
        )}
        <h3>Fichas autorizadas</h3>
        <p className="muted small">
          O aluno precisa autorizar a consulta de seus treinos. Medidas corporais permanecem
          privadas.
        </p>
        {data.workouts.length ? (
          data.workouts.map((w) => (
            <details key={w.id}>
              <summary>
                {w.title} • {data.students.find((s) => s.id === w.studentId)?.name}
              </summary>
              {w.exercises.map((e) => (
                <p className="small" key={e.id}>
                  {e.name}: {e.sets} × {e.reps}, descanso {e.rest}s
                </p>
              ))}
            </details>
          ))
        ) : (
          <Empty>Nenhuma ficha disponível com suas permissões atuais.</Empty>
        )}
      </Card>
      {editing && (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="person-title">
            <h2 id="person-title">{editing === 'new' ? 'Novo cadastro' : 'Editar cadastro'}</h2>
            <form onSubmit={save}>
              <Input
                label="Nome completo"
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="E-mail"
                disabled={editing !== 'new'}
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {tab === 'students' && (
                <>
                  <label className="field">
                    Professor
                    <select
                      value={form.teacherId}
                      onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    >
                      <option value="">Não atribuído</option>
                      {data.teachers.map((t) => (
                        <option value={t.id} key={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Plano
                    <select
                      value={form.plan}
                      onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    >
                      {['Smart', 'Fit', 'Black'].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    Aluno ativo
                  </label>
                </>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="actions">
                <Button type="submit" disabled={busy}>
                  {busy ? 'Salvando…' : editing === 'new' ? 'Enviar convite' : 'Salvar cadastro'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
