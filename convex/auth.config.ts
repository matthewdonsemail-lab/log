import type { AuthConfig } from 'convex/server'

// Configure these on the DEV deployment to match the gateway's JWT verifier.
// No providers means unauthenticated requests remain denied, never bypassed.
const domain = process.env.AUTH_ISSUER
const applicationID = process.env.AUTH_AUDIENCE
export default {
  providers: domain && applicationID ? [{ domain, applicationID }] : [],
} satisfies AuthConfig
