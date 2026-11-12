import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';
import { Plus, Activity, Flame, Scale, ArrowLeft, Check } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { today } from '../data/seed';
import { Button, Card, Input, Empty, PageTitle } from '../components/UI';
import { daysAgo, displayDate } from '../utils/dates';
export default function Evolution() {
  const { data, user, mutate, busy, notify } = useApp();
  const [period, setPeriod] = useState(90);
  const [dateFrom, setDateFrom] = useState(() => daysAgo(90));
  const [dateTo, setDateTo] = useState(today);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), weight: '', waist: '', chest: '' });
  const start = period === 'custom' ? dateFrom : daysAgo(period);
  const end = period === 'custom' ? dateTo : today();
  const validRange = Boolean(start && end && start <= end && end <= today());
  const measurements = data.measurements
    .filter((m) => m.studentId === user.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const filtered = measurements.filter((m) => validRange && m.date >= start && m.date <= end);
  const history = data.history
    .filter((h) => validRange && h.studentId === user.id && h.date >= start && h.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date));
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const date = daysAgo(6 - i, validRange ? end : today());
    const d = new Date(`${date}T12:00:00`);
    return {
      day: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      treinos: history.filter((h) => h.date === date).length,
    };
  });
  const delta =
    filtered.length > 1 ? (filtered.at(-1).weight - filtered[0].weight).toFixed(1) : null;
  async function save(e) {
    e.preventDefault();
    if (!data.students.some((s) => s.id === user.id && s.active))
      return notify('É necessário um cadastro de aluno ativo para registrar medidas.');
    if (form.date > today()) return notify('Escolha uma data até hoje.');
    const entry = {
      ...form,
      id: crypto.randomUUID(),
      studentId: user.id,
      weight: Number(form.weight),
      waist: Number(form.waist),
      chest: Number(form.chest),
    };
    if (
      await mutate(
        (api) => api.saveMeasures(entry),
        'Medidas registradas. Um registro na mesma data é atualizado.',
      )
    )
      setOpen(false);
  }
  const tooltip = {
    contentStyle: { background: '#232427', border: '1px solid #444', color: '#fff' },
  };
  return (
    <>
      <PageTitle eyebrow="SEU ESFORÇO TEM HISTÓRIA" title="Cada passo é evolução.">
        <Button
          onClick={() => setOpen(true)}
          disabled={!data.students.some((s) => s.id === user.id && s.active)}
        >
          <Plus size={17} />
          Registrar medidas
        </Button>
      </PageTitle>
      <div className="card-heading">
        <Link className="text-link" to="/aluno">
          <ArrowLeft size={16} />
          Voltar ao meu treino
        </Link>
        <label className="period">
          Período
          <select
            aria-label="Filtrar período"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value === 'custom' ? 'custom' : Number(e.target.value))
            }
          >
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
            <option value="custom">Datas personalizadas</option>
          </select>
        </label>
      </div>
      {period === 'custom' && (
        <div className="filter-bar">
          <Input
            label="Data inicial"
            type="date"
            required
            max={dateTo || today()}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Data final"
            type="date"
            required
            min={dateFrom}
            max={today()}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          {!validRange && (
            <p className="error" role="alert">
              Escolha um período válido, com a data inicial anterior à final e sem datas futuras.
            </p>
          )}
        </div>
      )}
      <div className="grid three metrics">
        {[
          [Flame, history.length, 'Treinos no período'],
          [
            Scale,
            measurements.length ? `${measurements.at(-1).weight} kg` : '—',
            'Último peso registrado',
          ],
          [
            Activity,
            delta !== null ? `${delta > 0 ? '+' : ''}${delta} kg` : '—',
            'Variação no período',
          ],
        ].map(([Icon, value, label]) => (
          <Card key={label}>
            <Icon />
            <strong>{value}</strong>
            <span>{label}</span>
            <small>Registros da sua conta</small>
          </Card>
        ))}
      </div>
      <div className="grid two">
        <Card>
          <div className="card-heading">
            <h3>Evolução do peso</h3>
            <span className="badge">kg • seus registros</span>
          </div>
          {filtered.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filtered}>
                <CartesianGrid stroke="#2d2e32" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(s) => s.slice(5).split('-').reverse().join('/')}
                  stroke="#929398"
                />
                <YAxis domain={['auto', 'auto']} stroke="#929398" />
                <Tooltip {...tooltip} />
                <Line
                  dataKey="weight"
                  name="Peso (kg)"
                  stroke="#ef3b3b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty>Registre medidas ou amplie o período para visualizar a evolução.</Empty>
          )}
        </Card>
        <Card>
          <div className="card-heading">
            <h3>Frequência semanal</h3>
            <span className="badge">7 dias até {displayDate(validRange ? end : today())}</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekly}>
              <CartesianGrid stroke="#2d2e32" vertical={false} />
              <XAxis dataKey="day" stroke="#929398" />
              <YAxis allowDecimals={false} stroke="#929398" />
              <Tooltip {...tooltip} />
              <Bar
                dataKey="treinos"
                name="Treinos concluídos"
                fill="#ef3b3b"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid two evolution-lists">
        <Card>
          <h3>Histórico de treinos</h3>
          {history.map((h) => (
            <div className="history-line" key={h.id}>
              <span className="mini-check">
                <Check size={16} />
              </span>
              <div>
                <b>{h.title}</b>
                <small>{new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}</small>
              </div>
              <span className="status">Concluído</span>
            </div>
          ))}
          {!history.length && <Empty>Nenhum treino concluído neste período.</Empty>}
        </Card>
        <Card>
          <h3>Registro de medidas</h3>
          <p className="muted small">
            Um registro por dia • Salvar na mesma data substitui as medidas.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>Cintura</th>
                  <th>Tórax</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>{m.weight} kg</td>
                    <td>{m.waist} cm</td>
                    <td>{m.chest} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && <Empty>Suas medidas aparecerão aqui.</Empty>}
          <p className="info">
            Sua jornada é única. Compare seu progresso com você mesmo e mantenha a constância.
          </p>
        </Card>
      </div>
      {open && (
        <Modal
          titleId="measure-title"
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <h2 id="measure-title">Registrar medidas</h2>
          <p className="muted">Suas medidas são visíveis somente para sua conta.</p>
          <form onSubmit={save}>
            <Input
              label="Data"
              type="date"
              max={today()}
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {[
              ['weight', 'Peso (kg)', 20, 350],
              ['waist', 'Cintura (cm)', 30, 250],
              ['chest', 'Tórax (cm)', 30, 250],
            ].map(([key, label, min, max]) => (
              <Input
                key={key}
                label={label}
                type="number"
                min={min}
                max={max}
                step="0.1"
                required
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ))}
            <div className="actions">
              <Button type="submit" disabled={busy}>
                {busy ? 'Salvando…' : 'Salvar medidas'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
