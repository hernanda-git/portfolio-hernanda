import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig, runnerImport, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function staticPrototypeRoutes(): Plugin {
  return {
    name: 'atlas-static-routes',
    apply: 'build',
    async writeBundle({ dir }) {
      if (!dir) throw new Error('Atlas requires a build output directory');
      const { module } = await runnerImport<{ STATIC_ROUTE_PATHS: string[] }>(
        resolve(import.meta.dirname, 'src/routes.ts'),
      );
      const entry = resolve(dir, 'index.html');
      await copyFile(entry, resolve(dir, '404.html'));
      for (const route of module.STATIC_ROUTE_PATHS) {
        if (route === '/') continue;
        const destination = resolve(dir, route.slice(1));
        await mkdir(destination, { recursive: true });
        await copyFile(entry, resolve(destination, 'index.html'));
      }
    },
  };
}

const base = process.env.PORTFOLIO_BASE?.replace(/^\/+|\/+$/g, '');

export default defineConfig({
  plugins: [react(), staticPrototypeRoutes()],
  base: base ? `/${base}/` : '/',
  build: {
    outDir: 'dist',
    copyPublicDir: false,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
