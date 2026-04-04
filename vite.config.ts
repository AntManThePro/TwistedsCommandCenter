import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (/[\\/]node_modules[\\/]react(-dom)?[\\/]/.test(id)) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
