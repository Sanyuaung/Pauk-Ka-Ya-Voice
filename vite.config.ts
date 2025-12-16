import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This securely replaces 'process.env.API_KEY' in your code with the actual value 
    // from the Vercel environment variables during the build process.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});