import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Honor a PORT env var when set (e.g. an auto-assigned preview port);
// `npm run dev` still pins 3100 via its --port flag.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: [
    { find: /^tweakers$/, replacement: fileURLToPath(new URL('../dist/index.js', import.meta.url)) },
    { find: /^tweakers\/(.*)$/, replacement: fileURLToPath(new URL('../dist/', import.meta.url)) + '$1' },
  ] },
  server: process.env.PORT ? { port: Number(process.env.PORT), host: true } : undefined,
});
