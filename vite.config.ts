/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Só os testes do jogo (nunca os de dentro de node_modules/dist).
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['.trycloudflare.com'],
    watch: {
      ignored: ['**/*.mp4', '**/*.jpg', '**/*.png', '**/dist/**']
    }
  },
});
