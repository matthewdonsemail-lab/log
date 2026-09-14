import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      // The fumadocs app (apps/docs, Next.js on :3001) renders the docs.
      // DashboardDocs embeds it in an iframe at /dashboard/docs, so /docs
      // (pages) and /_next (Next.js client assets) proxy over. Built-in
      // server.proxy runs before Vite's SPA fallback — a custom
      // configureServer middleware does not, which is why /docs used to
      // fall through to index.html (and the iframe showed onboarding).
      '/docs': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/_next': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
