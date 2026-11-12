import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Flame, Dumbbell, Clock, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { today } from '../data/seed';
import { completionKey } from '../utils/progress';
import { Card, Empty, PageTitle } from '../components/UI';
export default function Student() {
  const { data, user, mutate, busy } = useApp();
  const student = data.students.find((s) => s.id === user.id);

  const workouts = data.workouts.filter((w) => w.studentId === user.id);
  const actualDay = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][
    new Date(`${today()}T12:00:00`).getDay()
  ];
  const [selected, setSelected] = useState(actualDay);
  const [active, setActive] = useState('');
  const available = workouts.filter((w) => w.days.includes(selected));
  const workout = available.find((w) => w.id === active) || available[0];
  const key = workout ? completionKey(user.id, workout.id, today()) : '';
  const done = data.completed[key] || [];
  const completed = workout?.exercises.filter((e) => done.includes(e.id)).length || 0;
  const progress = workout ? Math.round((completed / workout.exercises.length) * 100) : 0;
  const history = data.history
    .filter((h) => h.studentId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  async function toggle(id) {
    await mutate((api) => api.toggleExercise(workout.id, id, today()), 'Progresso salvo.');
  }
  return (
    <>
      <PageTitle
        eyebrow="UM PASSO MAIS PERTO DO SEU OBJETIVO"
        title={`Vamos com tudo, ${user.name.split(' ')[0]}.`}
      >
        <Link className="button secondary" to="/evolucao">
          Minha evolução <ArrowUpRight size={17} />
        </Link>
      </PageTitle>
      <p className="intro">A constância transforma. O seu próximo treino começa aqui.</p>
      <div className="grid three student-metrics">
        <Card>
          <span className="eyebrow">SEU PLANO</span>
          <h2>
            IRON {student?.plan || '—'}
            <span className="red-dot" />
          </h2>
          <small>
            Plano selecionado{' '}
            {student ? (student.active ? '• Cadastro ativo' : '• Cadastro inativo') : ''}
          </small>
        </Card>
        <Card>
          <span className="eyebrow">QUEM TE ACOMPANHA</span>
          <h3>
            {data.teachers.find((t) => t.id === student?.teacherId)?.name || 'Professor a definir'}
          </h3>
          <small>Orientação e acompanhamento</small>
        </Card>
        <Card className="red-card">
          <Flame />
          <h3>{history.length} treinos concluídos</h3>
          <small>Cada treino conta. Continue em movimento.</small>
        </Card>
      </div>
      <Card className="consent-card">
        <h3>Permissões de consulta</h3>
        <p className="muted small">
          Você pode autorizar um administrador a consultar seus treinos e histórico. Suas medidas
          continuam privadas.
        </p>
        {data.admins.map((a) => (
          <label className="check-label" key={a.id}>
            <input
              type="checkbox"
              checked={a.allowed}
              disabled={busy}
              onChange={(e) => {
                void mutate(
                  (api) => api.adminAccess(a.id, e.target.checked),
                  'Permissão atualizada.',
                );
              }}
            />
            {a.name}
          </label>
        ))}
      </Card>
      <div className="grid student-grid">
        <section>
          <div className="card-heading">
            <h2>Sua semana de treino</h2>
            <CalendarDays size={20} />
          </div>
          <div className="week-picker">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <button
                key={day}
                className={selected === day ? 'active' : ''}
                onClick={() => {
                  setSelected(day);
                  setActive('');
                }}
              >
                {day}
                <span>{workouts.some((w) => w.days.includes(day)) ? '●' : '—'}</span>
              </button>
            ))}
          </div>
          <p className="muted small">
            A semana mostra sua divisão. Marcações são registradas na data de hoje (
            {new Date().toLocaleDateString('pt-BR')}).
          </p>
          {available.length > 1 && (
            <label className="field">
              Selecione a ficha
              <select value={workout?.id} onChange={(e) => setActive(e.target.value)}>
                {available.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {workout ? (
            <Card className="daily-workout">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">
                    {selected === actualDay
                      ? 'TREINO DO DIA'
                      : `DIVISÃO • ${selected.toUpperCase()}`}
                  </span>
                  <h2>{workout.title}</h2>
                  <p className="muted">
                    <Dumbbell size={16} /> {workout.exercises.length} exercícios <span>•</span>{' '}
                    <Clock size={16} /> Cerca de {workout.exercises.length * 8} min
                  </p>
                </div>
                <span className="badge">
                  {completed}/{workout.exercises.length}
                </span>
              </div>
              <div className="progress-track">
                <div style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-label">
                <span>Seu progresso de hoje</span>
                <b>{progress}%</b>
              </div>
              {workout.exercises.map((e, i) => (
                <div
                  className={`exercise-check ${done.includes(e.id) ? 'finished' : ''}`}
                  key={e.id}
                >
                  <span className="exercise-index">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{e.name}</h3>
                    <p>
                      {e.sets} séries <span>×</span> {e.reps} repetições <span>•</span> {e.rest}s de
                      descanso
                    </p>
                  </div>
                  <button
                    aria-label={`${done.includes(e.id) ? 'Desmarcar' : 'Concluir'} ${e.name}`}
                    aria-pressed={done.includes(e.id)}
                    disabled={!student?.active || busy}
                    onClick={() => toggle(e.id)}
                  >
                    {done.includes(e.id) ? <Check size={20} /> : <span />}
                  </button>
                </div>
              ))}
              {progress === 100 && (
                <p className="success">Treino finalizado. Excelente trabalho!</p>
              )}
            </Card>
          ) : (
            <Card>
              <Empty>
                {workouts.length
                  ? 'Dia de recuperação ou sem ficha programada. Selecione outro dia para ver seus treinos.'
                  : 'Nenhum treino atribuído. O professor pode criar sua primeira ficha no painel.'}
              </Empty>
            </Card>
          )}
        </section>
        <aside>
          <Card className="motivation">
            <Flame />
            <span className="eyebrow">LEMBRETE DO DIA</span>
            <h2>
              Você não precisa
              <br />
              ser perfeito.
              <br />
              <em>Precisa continuar.</em>
            </h2>
            <p>Respeite seu ritmo e celebre cada conquista.</p>
          </Card>
          <Card>
            <div className="card-heading">
              <h3>Últimas conquistas</h3>
              <Check size={18} />
            </div>
            {history.slice(0, 3).map((h) => (
              <div className="history-line" key={h.id}>
                <span className="mini-check">
                  <Check size={15} />
                </span>
                <div>
                  <b>{h.title}</b>
                  <small>{new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}</small>
                </div>
              </div>
            ))}
            {!history.length && <Empty>Seu primeiro treino concluído aparecerá aqui.</Empty>}
            <Link className="text-link" to="/evolucao">
              Ver histórico completo →
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
