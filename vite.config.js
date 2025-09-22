import { defineConfig } from 'vite';

export default defineConfig({
  base: '/uno-rev3-emu/',
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});