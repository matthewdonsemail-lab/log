/**
 * Re-export of the single app-wide id generator (lib/ids.ts). Messaging seeds
 * and the store mint every thread/message id through this, so all UUIDs come
 * from one implementation.
 */
export { uuid } from '../ids'