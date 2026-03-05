import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'vendor-mui';
          }

          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'vendor-forms';
          }

          if (id.includes('@tanstack')) {
            return 'vendor-query';
          }

          if (id.includes('react-router-dom') || id.includes('@remix-run')) {
            return 'vendor-router';
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'vendor-react';
          }

          return 'vendor-misc';
        },
      },
    },
  },
});
