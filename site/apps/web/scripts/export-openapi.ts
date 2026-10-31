import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateSpecs } from 'hono-openapi'
import { mockApiApp } from '../src/lib/mock-api'
import { openApiDocumentation } from '../src/lib/openapi'

/**
 * Export the mock's OpenAPI document for the docs app:
 * `pnpm --filter web openapi:export` writes `apps/docs/openapi.json`.
 * The mock runs in-browser via `app.request()`, so there is no HTTP server
 * to fetch from — the spec is generated in-process instead. Re-run whenever
 * routes or contract schemas change; the file is committed.
 */
const specs = await generateSpecs(mockApiApp, { documentation: openApiDocumentation })
const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(here, '..', '..', 'docs', 'openapi.json')
await writeFile(out, JSON.stringify(specs, null, 2) + '\n')
console.log(`wrote ${out} (${Object.keys(specs.paths ?? {}).length} paths)`)
