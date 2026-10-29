import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: '.vite-cache',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5012',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

