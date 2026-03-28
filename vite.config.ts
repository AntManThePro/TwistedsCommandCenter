import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('react') || id.includes('react-dom')) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
