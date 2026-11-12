import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Plus, Search, Pencil, Trash2, Dumbbell, Users, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exercises } from '../data/seed';
import { Button, Card, Input, Empty, PageTitle } from '../components/UI';
export default function Professor() {
  const { data, user, mutate, busy, notify } = useApp();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('active');
  const [dayFilter, setDayFilter] = useState('all');
  const catalogue = [
    ...new Set([...exercises, ...data.workouts.flatMap((w) => w.exercises.map((e) => e.name))]),
  ];
  const assigned = data.students.filter((s) => s.teacherId === user.id);
  const students = assigned.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) &&
      (status === 'all' || s.active === (status === 'active')),
  );
  const workouts = data.workouts.filter(
    (w) =>
      assigned.some((s) => s.id === w.studentId) &&
      (!selected || w.studentId === selected) &&
      (dayFilter === 'all' || w.days.includes(dayFilter)),
  );
  const newExercise = () => ({
    id: crypto.randomUUID(),
    name: exercises[0],
    sets: 3,
    reps: 12,
    rest: 60,
  });
  function open(w) {
    setForm(
      w
        ? { ...w, exercises: w.exercises.map((e) => ({ ...e })) }
        : {
            title: '',
            studentId:
              assigned.find((s) => s.id === selected && s.active)?.id ||
              assigned.find((s) => s.active)?.id ||
              '',
            days: ['Seg', 'Qua', 'Sex'],
            exercises: [newExercise()],
          },
    );
    setEditing(w?.id || 'new');
  }
  async function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.studentId || !form.days.length || !form.exercises.length)
      return notify('Preencha o título, aluno, dias e pelo menos um exercício.');
    const workout = {
      ...form,
      title: form.title.trim(),
      id: editing === 'new' ? crypto.randomUUID() : editing,
    };
    if (await mutate((api) => api.saveWorkout(workout), 'Ficha salva e disponível para o aluno.'))
      setEditing(null);
  }
  const editExercise = (id, key, value) =>
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    }));
  return (
    <>
      <PageTitle eyebrow="ORIENTE. INSPIRE. TRANSFORME." title={`Olá, ${user.name.split(' ')[0]}.`}>
        <Button onClick={() => open()} disabled={!assigned.some((s) => s.active) || busy}>
          <Plus size={18} />
          Criar ficha
        </Button>
      </PageTitle>
      <p className="intro">Cada aluno tem uma jornada. Ajude a construir o próximo passo.</p>
      <div className="grid three metrics">
        {[
          [Users, assigned.length, 'Alunos sob sua orientação'],
          [
            ClipboardList,
            data.workouts.filter((w) => assigned.some((s) => s.id === w.studentId)).length,
            'Fichas dos seus alunos',
          ],
          [Dumbbell, catalogue.length, 'Exercícios disponíveis'],
        ].map(([Icon, n, label]) => (
          <Card key={label}>
            <Icon />
            <strong>{n}</strong>
            <span>{label}</span>
          </Card>
        ))}
      </div>
      <div className="grid professor-grid">
        <Card>
          <h3>Alunos cadastrados</h3>
          <p className="muted">Somente alunos sob sua responsabilidade.</p>
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Pesquisar aluno"
              placeholder="Pesquisar por nome…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="field">
            Situação do aluno
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="all">Todos</option>
            </select>
          </label>
          <button
            className={`student-pick ${!selected ? 'chosen' : ''}`}
            onClick={() => setSelected('')}
          >
            Todos os treinos <span>{data.workouts.length}</span>
          </button>
          {students.map((s) => (
            <button
              key={s.id}
              className={`student-pick ${selected === s.id ? 'chosen' : ''}`}
              onClick={() => setSelected(s.id)}
            >
              <span className="avatar">{s.name.slice(0, 2).toUpperCase()}</span>
              <span>
                {s.name}
                <small>
                  {s.teacherId === user.id
                    ? 'Seu aluno'
                    : data.teachers.find((t) => t.id === s.teacherId)?.name || 'Sem professor'}{' '}
                  • {s.plan}
                </small>
              </span>
            </button>
          ))}
          {!students.length && <Empty>Nenhum aluno encontrado.</Empty>}
        </Card>
        <div>
          <div className="card-heading">
            <h2>
              {selected
                ? `Treinos de ${data.students.find((s) => s.id === selected)?.name.split(' ')[0]}`
                : 'Fichas de treino'}
            </h2>
            <label className="field">
              Dia da ficha
              <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
                <option value="all">Todos os dias</option>
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <span className="badge">{workouts.length} fichas</span>
          </div>
          {workouts.map((w) => (
            <Card key={w.id} className="workout-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">
                    {data.students.find((s) => s.id === w.studentId)?.name || 'Aluno removido'}
                  </span>
                  <h3>{w.title}</h3>
                  <small>{w.days.join(' • ')}</small>
                </div>
                <div className="row-actions">
                  <button aria-label={`Editar ${w.title}`} onClick={() => open(w)}>
                    <Pencil size={17} />
                  </button>
                  <button
                    aria-label={`Excluir ${w.title}`}
                    disabled={busy}
                    onClick={async () => {
                      if (confirm('Excluir esta ficha de treino?'))
                        await mutate((api) => api.deleteWorkout(w.id), 'Ficha excluída.');
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              {w.exercises.map((e, i) => (
                <div className="exercise-line" key={e.id}>
                  <span className="exercise-index">{String(i + 1).padStart(2, '0')}</span>
                  <b>{e.name}</b>
                  <span>
                    {e.sets} × {e.reps} <small>• {e.rest}s</small>
                  </span>
                </div>
              ))}
            </Card>
          ))}
          {!workouts.length && (
            <Card>
              <Empty>Nenhuma ficha por aqui. Crie um treino para começar.</Empty>
            </Card>
          )}
        </div>
      </div>
      <Card className="form-actions">
        <h3>Progresso dos seus alunos</h3>
        {data.history.length ? (
          data.history.map((h) => (
            <p key={h.id} className="small">
              {data.students.find((s) => s.id === h.studentId)?.name} • {h.title} •{' '}
              {new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </p>
          ))
        ) : (
          <Empty>Nenhum treino concluído pelos alunos atribuídos.</Empty>
        )}
      </Card>
      {editing && (
        <Modal
          titleId="workout-title"
          wide
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <h2 id="workout-title">{editing === 'new' ? 'Nova ficha de treino' : 'Editar ficha'}</h2>
          <form onSubmit={save}>
            <Input
              label="Nome da ficha"
              placeholder="Treino B • Inferiores"
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <label className="field">
              Atribuir ao aluno
              <select
                required
                disabled={editing !== 'new'}
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              >
                {assigned
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            <datalist id="exercise-catalogue">
              {catalogue.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="small muted">
              Selecione uma sugestão ou escreva o nome de outro exercício para incluí-lo na ficha.
            </p>
            <p>Dias da semana</p>
            <div className="days">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={form.days.includes(day)}
                    onChange={() =>
                      setForm({
                        ...form,
                        days: form.days.includes(day)
                          ? form.days.filter((d) => d !== day)
                          : [...form.days, day],
                      })
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
            {form.exercises.map((ex, i) => (
              <fieldset className="exercise-editor" key={ex.id}>
                <legend>Exercício {i + 1}</legend>
                <label className="field">
                  Nome do exercício
                  <input
                    list="exercise-catalogue"
                    required
                    maxLength={100}
                    value={ex.name}
                    onChange={(e) => editExercise(ex.id, 'name', e.target.value)}
                  />
                </label>
                <div className="grid three">
                  {[
                    ['sets', 'Séries', 1, 20],
                    ['reps', 'Repetições', 1, 100],
                    ['rest', 'Descanso (s)', 0, 600],
                  ].map(([key, label, min, max]) => (
                    <Input
                      key={key}
                      label={label}
                      type="number"
                      min={min}
                      max={max}
                      required
                      value={ex[key]}
                      onChange={(e) => editExercise(ex.id, key, Number(e.target.value))}
                    />
                  ))}
                </div>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={form.exercises.length === 1}
                  onClick={() =>
                    setForm({ ...form, exercises: form.exercises.filter((x) => x.id !== ex.id) })
                  }
                >
                  Remover exercício
                </Button>
              </fieldset>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setForm({ ...form, exercises: [...form.exercises, newExercise()] })}
            >
              <Plus size={17} />
              Adicionar exercício
            </Button>
            <div className="actions form-actions">
              <Button type="submit" disabled={busy}>
                {busy ? 'Salvando…' : 'Salvar ficha'}
              </Button>
              <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
