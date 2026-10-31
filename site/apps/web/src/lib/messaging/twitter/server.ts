import { buildMessagingRoutes } from '../routes'

/**
 * X (Twitter) DM routing.
 *
 * Stands in for the unofficial browser client's dm surface: a flat
 * dm_events stream grouped by `dm_conversation_id` (1:1 = the two
 * participant user ids joined with a dash), plus the
 * `POST /2/dm_conversations/with/:participant_id/messages` compose. The
 * shared handler lives in `routes.ts`; the id shapes are described in the
 * OpenAPI schemas (`openapi.ts` → XThreadSchema / XMessageSchema).
 */
export const xMessagingApp = buildMessagingRoutes('x')

/** Legacy alias — the same app instance, kept so pre-rename `/messaging/twitter` clients don't 404. */
export const twitterMessagingApp = xMessagingApp