import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        app:     resolve(__dirname, 'app/index.html'),
      },
    },
  },
});
