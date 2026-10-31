import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Pin both to the app's own copies so the ui kit can never pull a
      // second React from a stray store.
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    },
    // One React only: @listeningkit/ui must share the app's copy, or hooks
    // read a dispatcher that react-dom never set (stray installs can leave a
    // second copy behind — dedupe forces them back together in tests).
    dedupe: ['react', 'react-dom']
  },
  test: {
    environment: 'node',
    // Tests stay hermetic: a developer's .env.local Convex URL must not reroute the bridge tests.
    env: { VITE_CONVEX_URL: '' },
    server: { deps: { inline: ['react', 'react-dom', '@radix-ui/react-slot', '@radix-ui/react-compose-refs'] } },
  }
})