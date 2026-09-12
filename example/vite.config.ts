import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Honor a PORT env var when set (e.g. an auto-assigned preview port);
// `npm run dev` still pins 3100 via its --port flag.
export default defineConfig({
  plugins: [react()],
  server: {
    // The kit is linked from a sibling checkout; its bundled font
    // (dist/fonts) sits outside this app, and vite refuses such assets
    // unless the folder is allowed.
    fs: { allow: ['..'] },
    ...(process.env.PORT ? { port: Number(process.env.PORT), host: true } : {}),
  },
});
