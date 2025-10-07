// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is taken
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  base: './', // Important for Electron to load assets correctly
})