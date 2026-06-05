import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    // Proxy /api/v1/* → backend in dev so the browser never sees a CORS request.
    // The frontend code still uses VITE_API_URL (or the axios baseURL) for non-proxied envs.
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/ml-api': {
        target: 'https://habitscape-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ml-api/, ''),
      },
    },
  },
})
