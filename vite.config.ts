import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent "process is not defined" errors in browser
    'process.env': {},
    // Securely inject the API Key during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});