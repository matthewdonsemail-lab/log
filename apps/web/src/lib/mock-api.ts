import { Hono } from 'hono'
import { apiKeysApp } from './api/server'
import { brandApp } from './brand/server'
import { keywordsApp } from './keywords/server'
import { listingsApp } from './listings/server'
import { connectionsApp } from './connections/server'
import { communitiesApp } from './communities/server'
import { feedApp } from './feed/server'
import { messagingApp } from './messaging/index'
import { requestLogger } from './request-log'

/**
 * All mock apps on one root, for the OpenAPI export and the dev mock
 * server. Sub-apps keep their absolute internal paths (all distinct), so
 * everything mounts at root except messaging, already namespaced. Only
 * routes carrying `describeRoute` appear in the generated spec — the rest
 * still serve over HTTP for the playground.
 *
 * The request logger is the single middleware on this root: one redacted
 * method/path/status line per request, from every domain, on both
 * consumption paths (in-process `app.request()` and the standalone HTTP
 * server). Opt-in via `VITE_MOCK_API_LOG_REQUESTS=1` (dashboard / vitest)
 * or `MOCK_API_LOG_REQUESTS=1` (standalone `mock:server`); silent otherwise.
 */
export const mockApiApp = new Hono()
  .use('*', requestLogger())
  .route('/', apiKeysApp)
  .route('/', brandApp)
  .route('/', keywordsApp)
  .route('/', listingsApp)
  .route('/', connectionsApp)
  .route('/', communitiesApp)
  .route('/', feedApp)
  .route('/messaging', messagingApp)

export type MockApiApp = typeof mockApiApp
