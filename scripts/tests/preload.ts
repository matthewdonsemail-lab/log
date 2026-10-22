import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const scratch = mkdtempSync(join(tmpdir(), 'logCliTestRuns'))
process.env.LOG_RUNS_DIR ??= join(scratch, 'runs')
process.env.LOG_UNSAVED_DIR ??= join(scratch, 'runs', 'unsaved')
process.env.LOG_CAPTURES_ROOT ??= scratch
process.env.LOG_MCP_OAUTH_FILE ??= join(scratch, 'mcpOauth.json')
process.env.LOG_MCP_JOBS_DIR ??= join(scratch, 'mcpJobs')
process.env.LOG_INSPECT_CURRENT ??= join(scratch, 'inspect', 'current.json')
