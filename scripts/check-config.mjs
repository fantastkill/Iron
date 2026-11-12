const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
let safe = false;
try {
  safe =
    key?.startsWith('sb_publishable_') ||
    JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon';
} catch {
  /* configuração ausente/inválida */
}
if (!url?.startsWith('https://') || !safe) {
  console.error(
    'Deploy bloqueado: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY públicas nas Variables do GitHub.',
  );
  process.exit(1);
}
console.log('Configuração pública presente; isso não substitui os testes reais de integração.');
