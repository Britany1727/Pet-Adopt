import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // SPA: todas las rutas van al index.html
  // Vercel lo maneja con vercel.json
});