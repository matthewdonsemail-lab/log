import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { consoleEvents, localConsoleMode } from './server/consoleEvents'

const controlServiceUrl = process.env.CONTROL_SERVICE_URL || 'http://127.0.0.1:8765'
const controlServiceIsRemote = controlServiceUrl.startsWith('https://')
const controlServiceProxy = { target: controlServiceUrl, changeOrigin: controlServiceIsRemote }
const localConsoleApi = process.env.LOG_CONSOLE_API
const localConsoleProxy = localConsoleApi ? { '/api/console': { target: localConsoleApi, changeOrigin: false } } : {}

export default defineConfig({
  plugins: [react(), consoleEvents(), ...(localConsoleApi ? [localConsoleMode()] : [])],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      ...localConsoleProxy,
      '/api/v1': controlServiceProxy,
      '/oauth': controlServiceProxy,
      '/.well-known': controlServiceProxy,
      '/bridge': { ...controlServiceProxy, ws: true },
      '/mcp': { ...controlServiceProxy, bypass: (req) => (req.method === 'GET' ? req.url : undefined) },
      // The repo modal posts newsletter signups to the member-site endpoint on listeningkit.com
      // (vercel.json rewrites the same path in production). Listed before /api so it wins.
      '/api/kit': {
        target: 'https://listeningkit.com',
        changeOrigin: true
      },
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
