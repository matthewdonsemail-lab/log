import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'node',
    // Tests stay hermetic: a developer's .env.local Convex URL must not reroute the bridge tests.
    env: { VITE_CONVEX_URL: '' }
  }
})