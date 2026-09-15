import { buildMessagingRoutes } from '../routes'

/**
 * Reddit private-message routes, mounted at `/messaging/reddit` in
 * `index.ts`.
 *
 * Stands in for the unofficial browser client's inbox/outbox surface:
 * flattened message listings (`t4_` fullnames, `created_utc`) that the
 * client groups into threads by `first_message_name`, plus compose-to-
 * username. The shared handler lives in `routes.ts`; the id shapes are
 * described in the OpenAPI schemas (`openapi.ts` → RedditThreadSchema /
 * RedditMessageSchema).
 */
export const redditMessagingApp = buildMessagingRoutes('reddit')