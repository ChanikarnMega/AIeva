import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During `npm run dev`, proxy API calls to a locally running
      // `netlify dev` (or any server) on port 9000. Prefer `netlify dev`
      // for local work so the functions themselves run too.
      '/api': 'http://localhost:9000',
    },
  },
});
