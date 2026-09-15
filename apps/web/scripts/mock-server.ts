import { serve } from '@hono/node-server'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { openAPIRouteHandler } from 'hono-openapi'
import { mockApiApp } from '../src/lib/mock-api'
import { MOCK_SERVER_PORT, openApiDocumentation } from '../src/lib/openapi'

/**
 * Live HTTP mock for the docs playground: `pnpm --filter web mock:server`.
 * Same apps, same seeds as the in-browser dashboard mock (fresh seeds per
 * boot — no localStorage under node). Serves the generated spec plus the
 * Scalar reference, so requests can be tried for real:
 * spec at /openapi.json, interactive UI at /scalar.
 */
mockApiApp.use('*', cors())
mockApiApp.get('/openapi.json', openAPIRouteHandler(mockApiApp, { documentation: openApiDocumentation }))
mockApiApp.get('/scalar', Scalar({ url: '/openapi.json', pageTitle: 'ListeningKit Mock API' }))

serve({ fetch: mockApiApp.fetch, port: MOCK_SERVER_PORT }, (info) => {
  console.log(`mock API on http://localhost:${info.port} — Scalar at http://localhost:${info.port}/scalar`)
})
