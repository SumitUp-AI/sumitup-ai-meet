import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const rawAllowedHosts =
    env.ALLOWED_HOSTS ||
    env.VITE_ALLOWED_HOSTS ||
    process.env.ALLOWED_HOSTS ||
    process.env.VITE_ALLOWED_HOSTS;

  const allowedHosts: true | string[] = (() => {
    if (!rawAllowedHosts) {
      return ['danishansari.me', 'www.danishansari.me', '.danishansari.me'];
    }
    const trimmed = rawAllowedHosts.trim();
    if (trimmed === 'true' || trimmed === '*' || trimmed === 'all') {
      return true;
    }
    return trimmed
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean);
  })();

  const host = env.HOST || process.env.HOST || '0.0.0.0';
  const port = Number(env.PORT || process.env.PORT) || 5173;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: host === 'true' ? true : host,
      port,
      allowedHosts,
    },
    preview: {
      host: host === 'true' ? true : host,
      port,
      allowedHosts,
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'TS2322' || warning.code === 'TS6133') return; // Ignore type errors
          warn(warning);
        },
      },
    },
  };
});

