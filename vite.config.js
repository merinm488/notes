import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://192.168.0.101:3003',
        changeOrigin: true
      }
    }
  }
})
