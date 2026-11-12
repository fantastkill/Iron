import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'TEST_STUDENT_EMAIL',
  'TEST_STUDENT_PASSWORD',
  'TEST_OTHER_STUDENT_EMAIL',
  'TEST_OTHER_STUDENT_PASSWORD',
  'TEST_TEACHER_EMAIL',
  'TEST_TEACHER_PASSWORD',
  'TEST_ADMIN_EMAIL',
  'TEST_ADMIN_PASSWORD',
];
if (required.some((k) => !process.env[k])) {
  console.error(
    'Integração NÃO executada: preencha o ambiente de teste isolado descrito em supabase/SETUP.md.',
  );
  process.exit(2);
}
const client = () =>
  createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const accounts = ['STUDENT', 'OTHER_STUDENT', 'TEACHER', 'ADMIN'];
const clients = [];
try {
  for (const role of accounts) {
    const c = client();
    clients.push(c);
    const { data, error } = await c.auth.signInWithPassword({
      email: process.env[`TEST_${role}_EMAIL`],
      password: process.env[`TEST_${role}_PASSWORD`],
    });
    assert.ifError(error);
    assert.ok(data.session);
  }
  const [student, other, teacher, admin] = clients;
  const ids = await Promise.all(clients.map(async (c) => (await c.auth.getUser()).data.user.id));
  const roles = ['aluno', 'aluno', 'professor', 'admin'];
  for (let i = 0; i < clients.length; i++) {
    const { data, error } = await clients[i].from('profiles').select('*').eq('id', ids[i]).single();
    assert.ifError(error);
    assert.equal(data.role, roles[i]);
  }
  const invalid = await client().auth.signInWithPassword({
    email: process.env.TEST_STUDENT_EMAIL,
    password: `incorrect-${crypto.randomUUID()}`,
  });
  assert.ok(invalid.error);
  const unknown = await client().auth.signInWithPassword({
    email: `missing-${crypto.randomUUID()}@example.com`,
    password: crypto.randomUUID(),
  });
  assert.ok(unknown.error);
  const otherProfile = await student.from('profiles').select('*').eq('id', ids[1]);
  assert.ifError(otherProfile.error);
  assert.deepEqual(otherProfile.data, []);
  const own = await student.from('profiles').select('*').eq('id', ids[0]).single();
  assert.ifError(own.error);
  assert.equal(own.data.teacher_id, ids[2], 'Atribua o primeiro aluno ao professor de teste.');
  const second = await admin.from('profiles').select('*').eq('id', ids[1]).single();
  assert.ifError(second.error);
  assert.notEqual(
    second.data.teacher_id,
    ids[2],
    'O segundo aluno deve pertencer a outro professor ou ficar sem professor.',
  );
  const teacherOther = await teacher.from('profiles').select('*').eq('id', ids[1]);
  assert.ifError(teacherOther.error);
  assert.deepEqual(teacherOther.data, []);
  const elevation = await student.from('profiles').update({ role: 'admin' }).eq('id', ids[0]);
  assert.ok(elevation.error);
  const denied = await student.rpc('admin_update_plan', { p_name: 'Fit', p_price: 1 });
  assert.ok(denied.error);
  const anon = await client().from('profiles').select('*');
  assert.ok(anon.error || anon.data.length === 0);
  let workoutId;
  try {
    const ex = {
      id: crypto.randomUUID(),
      name: 'Exercício de integração',
      sets: 3,
      reps: 12,
      rest: 60,
    };
    const workout = {
      id: crypto.randomUUID(),
      student_id: ids[0],
      title: 'Teste integração descartável',
      days: ['Seg'],
      exercises: [ex],
    };
    const created = await teacher.from('workouts').insert(workout);
    assert.ifError(created.error);
    workoutId = workout.id;
    const unauthorized = await other.from('workouts').select('*').eq('id', workoutId);
    assert.ifError(unauthorized.error);
    assert.deepEqual(unauthorized.data, []);
    const adminDenied = await admin.from('workouts').select('*').eq('id', workoutId);
    assert.ifError(adminDenied.error);
    assert.deepEqual(
      adminDenied.data,
      [],
      'Revogue o consentimento desse administrador no aluno de teste.',
    );
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const progress = await student.rpc('toggle_exercise', {
      p_workout: workoutId,
      p_exercise: ex.id,
      p_date: date,
    });
    assert.ifError(progress.error);
    const history = await student.from('workout_history').select('*').eq('workout_id', workoutId);
    assert.ifError(history.error);
    assert.equal(history.data.length, 1);
    const forbidden = await other.rpc('toggle_exercise', {
      p_workout: workoutId,
      p_exercise: ex.id,
      p_date: date,
    });
    assert.ok(forbidden.error);
    const inviteDenied = await student.functions.invoke('manage-users', {
      body: {
        action: 'invite',
        role: 'professor',
        email: 'blocked@example.com',
        name: 'Blocked',
        plan: 'Fit',
      },
    });
    assert.ok(inviteDenied.error);
  } finally {
    if (workoutId) {
      const deleted = await teacher.from('workouts').delete().eq('id', workoutId);
      assert.ifError(deleted.error);
    }
  }
  console.log(
    'Integração real aprovada: Auth, credenciais inválidas, perfis, RLS, ficha, progresso e Edge Function não administrativa.',
  );
  console.log(
    'Ainda validar manualmente cadastro/duplicidade, confirmação por e-mail, convite e recuperação, sessão após refresh, responsividade e URL pública.',
  );
} finally {
  for (const c of clients) await c.auth.signOut();
}
