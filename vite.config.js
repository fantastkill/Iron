import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
const environment = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'VITE_');
const publicKey = process.env.VITE_SUPABASE_ANON_KEY || environment.VITE_SUPABASE_ANON_KEY;
let privileged = publicKey?.startsWith('sb_secret_');
try {
  privileged ||=
    JSON.parse(Buffer.from(publicKey.split('.')[1], 'base64url').toString()).role ===
    'service_role';
} catch {
  /* chave pública opaca ou configuração ausente */
}
if (privileged)
  throw new Error(
    'Chave administrativa proibida em VITE_SUPABASE_ANON_KEY. Use somente uma chave pública.',
  );
export default defineConfig({
  base: '/Iron/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase/')) return 'supabase';
          if (id.includes('node_modules') && /recharts|d3-|victory|react-smooth|decimal/.test(id))
            return 'charts';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['node_modules/**', 'e2e/**'],
    fileParallelism: false,
  },
});
