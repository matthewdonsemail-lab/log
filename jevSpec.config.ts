import { defineConfig } from 'jev-spec'
import { SPEC_BASE_URL, SPEC_MODEL, specTargets } from './src/specs/index'
import { subqKey } from './src/subq/decisions/index'

export default defineConfig({
  client: { model: SPEC_MODEL, baseUrl: SPEC_BASE_URL, allowCustomBaseUrl: true, apiKey: subqKey() ?? '', timeoutMs: 120_000 },
  targets: (await specTargets(process.cwd())) as never,
})
