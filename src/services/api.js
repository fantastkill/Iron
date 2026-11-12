import { completionKey } from '../utils/progress';
export const emptyData = () => ({
  students: [],
  teachers: [],
  admins: [],
  plans: [],
  workouts: [],
  completed: {},
  history: [],
  measurements: [],
  invitations: [],
});
const check = (result) => {
  if (result.error) throw result.error;
  return result.data;
};
async function manageUsers(client, body) {
  const result = await client.functions.invoke('manage-users', { body });
  if (result.error?.context instanceof Response) {
    const payload = await result.error.context.json().catch(() => null);
    if (payload?.error) throw new Error(payload.error);
  }
  return check(result);
}
export const mapProfile = (p) => ({
  id: p.id,
  name: p.name,
  email: p.email,
  role: p.role,
  teacherId: p.teacher_id || '',
  plan: p.plan,
  active: p.active,
  passwordReady: p.password_ready !== false,
});
export async function loadData(client) {
  // Toda consulta passa pelo JWT do usuário e pelas políticas RLS no servidor.
  const tables = [
    'profiles',
    'plans',
    'workouts',
    'workout_progress',
    'workout_history',
    'measurements',
    'invitations',
  ];
  const result = await Promise.all(tables.map((t) => client.from(t).select('*')));
  const directory = check(await client.rpc('admin_directory'));
  const [profiles, plans, workouts, progress, history, measurements, invitations] =
    result.map(check);
  const people = profiles.map(mapProfile);
  return {
    students: people.filter((p) => p.role === 'aluno'),
    teachers: people.filter((p) => p.role === 'professor'),
    admins: directory,
    plans,
    workouts: workouts.map((w) => ({ ...w, studentId: w.student_id })),
    completed: Object.fromEntries(
      progress.map((p) => [completionKey(p.student_id, p.workout_id, p.date), p.completed]),
    ),
    history: history.map((h) => ({ ...h, studentId: h.student_id, workoutId: h.workout_id })),
    measurements: measurements.map((m) => ({ ...m, studentId: m.student_id })),
    invitations,
  };
}
export function createApi(client) {
  return {
    signIn: async (email, password) =>
      check(await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })),
    signUp: async ({ name, email, password, confirmation, plan, role = 'aluno' }, redirect) => {
      if (role !== 'aluno') throw new Error('Somente alunos podem se cadastrar publicamente.');
      if (!name.trim()) throw new Error('Informe seu nome.');
      if (password.length < 8) throw new Error('A senha deve ter pelo menos oito caracteres.');
      if (password !== confirmation) throw new Error('As senhas não coincidem.');
      const result = check(
        await client.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: redirect, data: { name: name.trim(), plan } },
        }),
      );
      if (result.user?.identities?.length === 0)
        throw new Error('E-mail já cadastrado. Entre ou recupere sua senha.');
      return result;
    },
    signOut: async () => check(await client.auth.signOut()),
    recover: async (email, redirect) =>
      check(
        await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${redirect}?type=recovery`,
        }),
      ),
    password: async (password) => {
      if (password.length < 8) throw new Error('Use pelo menos oito caracteres.');
      return check(await client.auth.updateUser({ password }));
    },
    profile: async (id) => {
      const result = await client.from('profiles').select('*').eq('id', id).single();
      if (result.error || !result.data)
        throw new Error(
          'Não foi possível acessar seu cadastro. Sua conta pode estar inativa; contate a administração.',
        );
      return mapProfile(result.data);
    },
    load: () => loadData(client),
    savePerson: async (person) =>
      check(
        await client.rpc('admin_update_profile', {
          p_id: person.id,
          p_name: person.name.trim(),
          p_plan: person.plan || 'Fit',
          p_teacher: person.teacherId || null,
          p_active: person.active,
        }),
      ),
    invite: async (person, role) =>
      manageUsers(client, {
        action: 'invite',
        email: person.email.trim().toLowerCase(),
        name: person.name.trim(),
        role,
        plan: person.plan || 'Fit',
      }),
    deletePerson: async (id) => manageUsers(client, { action: 'delete', id }),
    savePlan: async (plan) =>
      check(
        await client.rpc('admin_update_plan', { p_name: plan.name, p_price: Number(plan.price) }),
      ),
    saveWorkout: async (w) =>
      check(
        await client.from('workouts').upsert({
          id: w.id,
          student_id: w.studentId,
          title: w.title.trim(),
          days: w.days,
          exercises: w.exercises,
        }),
      ),
    deleteWorkout: async (id) => check(await client.from('workouts').delete().eq('id', id)),
    toggleExercise: async (workoutId, exerciseId, date) =>
      check(
        await client.rpc('toggle_exercise', {
          p_workout: workoutId,
          p_exercise: exerciseId,
          p_date: date,
        }),
      ),
    saveMeasures: async (m) =>
      check(
        await client.from('measurements').upsert(
          {
            student_id: m.studentId,
            date: m.date,
            weight: Number(m.weight),
            waist: Number(m.waist),
            chest: Number(m.chest),
          },
          { onConflict: 'student_id,date' },
        ),
      ),
    adminAccess: async (adminId, allowed) =>
      check(await client.rpc('set_admin_access', { p_admin: adminId, p_allowed: allowed })),
  };
}
