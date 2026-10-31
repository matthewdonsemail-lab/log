import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const envLocal = join(import.meta.dir, '..', '..', '.env.local')
if (!process.env.LOG_PYTHON && existsSync(envLocal)) {
  const line = readFileSync(envLocal, 'utf8').split(/\r?\n/).find((l) => l.startsWith('LOG_PYTHON='))
  if (line) process.env.LOG_PYTHON = line.slice('LOG_PYTHON='.length).trim().replace(/^["']|["']$/g, '')
}

const scratch = mkdtempSync(join(tmpdir(), 'logCliTestRuns'))
process.env.LOG_RUNS_DIR ??= join(scratch, 'runs')
process.env.LOG_UNSAVED_DIR ??= join(scratch, 'runs', 'unsaved')
process.env.LOG_CAPTURES_ROOT ??= scratch
process.env.LOG_MCP_OAUTH_FILE ??= join(scratch, 'mcpOauth.json')
process.env.LOG_MCP_JOBS_DIR ??= join(scratch, 'mcpJobs')
process.env.LOG_INSPECT_CURRENT ??= join(scratch, 'inspect', 'current.json')
process.env.LOG_MEMBERS_DIR ??= join(scratch, 'members')
delete process.env.LOG_ADSPOWER_HOMES
process.env.LOG_FBK_STATE = mkdtempSync(join(tmpdir(), "logFbkState"));
process.env.LOG_MCP_STAMP_FILE ??= join(scratch, 'mcpServer.json')
process.env.LOG_TWITTER_STATE ??= join(scratch, "twitterState")
process.env.LOG_PLATFORM_STATE ??= join(scratch, "platformState")
process.env.LOG_CONVERSATIONS_DIR ??= join(scratch, "conversations")
process.env.LOG_SEARCH_DIR ??= join(scratch, "search")
