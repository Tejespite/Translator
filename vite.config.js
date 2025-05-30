import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/vocabulary': {
        target: 'https://www.latin-is-simple.com',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api\/vocabulary/, '/api/vocabulary'),
      },
    },
  },
})
