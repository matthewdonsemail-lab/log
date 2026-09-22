import { defineApp } from 'convex/server'
import staticHosting from '@convex-dev/static-hosting/convex.config'
import treg from '@listeningkit/treg/convex.config'

// App-owned root routing: /ingest and /session keep their URLs, and the static site is the catch-all.
const app = defineApp()
app.use(staticHosting)
app.use(treg)

export default app
