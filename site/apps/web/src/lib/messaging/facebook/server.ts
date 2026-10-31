import { buildMessagingRoutes } from '../routes'

/**
 * Facebook (Messenger) messaging routes, mounted at `/messaging/facebook`
 * in `index.ts`.
 *
 * Stands in for the unofficial browser client's Messenger surface: the
 * conversation-object listing (numeric conversation id / `thread_key`) and
 * its `mid`-keyed message set. The shared handler lives in `routes.ts`;
 * the per-platform id shapes are described in the OpenAPI schemas
 * (`openapi.ts` → FacebookThreadSchema / FacebookMessageSchema).
 */
export const facebookMessagingApp = buildMessagingRoutes('facebook')