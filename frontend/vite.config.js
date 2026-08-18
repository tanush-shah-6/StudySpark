import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      PUBLIC_URL: '',
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
