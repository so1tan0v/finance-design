import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: { outDir: 'dist' },
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' }
});
