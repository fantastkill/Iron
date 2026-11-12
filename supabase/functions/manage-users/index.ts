import { createClient } from 'npm:@supabase/supabase-js@2';

// Executado SOMENTE no Supabase. Nenhuma chave administrativa chega ao Vite.
const allowedOrigin = Deno.env.get('APP_ORIGIN');
const appUrl = Deno.env.get('APP_URL');
Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin || '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
  const respond = (status: number, body: object) =>
    new Response(JSON.stringify(body), { status, headers });
  if (!allowedOrigin || !appUrl)
    return respond(503, { error: 'Configure APP_ORIGIN e APP_URL no servidor.' });
  if (origin && origin !== allowedOrigin) return respond(403, { error: 'Origem não autorizada.' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return respond(405, { error: 'Método não permitido.' });
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer '))
    return respond(401, { error: 'Autenticação necessária.' });
  const url = Deno.env.get('SUPABASE_URL')!;
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: identity, error: authError } = await caller.auth.getUser();
  if (authError || !identity.user) return respond(401, { error: 'Sessão inválida.' });
  const { data: profile, error: profileError } = await caller
    .from('profiles')
    .select('id,role,active,password_ready')
    .eq('id', identity.user.id)
    .single();
  if (profileError || profile?.role !== 'admin' || !profile.active || !profile.password_ready)
    return respond(403, { error: 'Acesso administrativo necessário.' });
  // Criar o cliente privilegiado só DEPOIS de validar o chamador no Auth e banco.
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const body = await request.json();
    if (body.action === 'invite') {
      const email = String(body.email || '')
        .trim()
        .toLowerCase();
      const name = String(body.name || '').trim();
      const role = body.role;
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !name ||
        name.length > 80 ||
        !['professor', 'aluno'].includes(role) ||
        !['Smart', 'Fit', 'Black'].includes(body.plan)
      )
        return respond(400, { error: 'Dados do convite inválidos.' });
      const { data: existing, error: lookupError } = await admin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existing)
        return respond(409, {
          error: 'E-mail já cadastrado. Não é possível alterar seu papel pelo convite.',
        });
      const { error: insertError } = await admin
        .from('invitations')
        .upsert({ email, name, role, plan: body.plan, invited_by: profile.id });
      if (insertError) throw insertError;
      const { error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: appUrl,
        data: { name, plan: body.plan },
      });
      if (error) {
        // Um convite autorizado fica listado para tentativa posterior; não cria login automático.
        return respond(400, {
          error:
            'Não foi possível enviar o convite. Confira o e-mail, a configuração SMTP e os limites do provedor. O convite autorizado permanece pendente.',
        });
      }
      return respond(200, { success: true });
    }
    if (body.action === 'delete') {
      if (typeof body.id !== 'string') return respond(400, { error: 'Identificador inválido.' });
      const { data: target, error } = await admin
        .from('profiles')
        .select('id,role')
        .eq('id', body.id)
        .single();
      if (error || !target || target.role === 'admin' || target.id === profile.id)
        return respond(403, { error: 'Conta não pode ser excluída por esta operação.' });
      const deleted = await admin.auth.admin.deleteUser(target.id);
      if (deleted.error) throw deleted.error;
      return respond(200, { success: true });
    }
    return respond(400, { error: 'Operação inválida.' });
  } catch {
    return respond(500, {
      error: 'Operação não concluída. Consulte os logs privados do servidor.',
    });
  }
});
