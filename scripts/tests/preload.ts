import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const scratch = mkdtempSync(join(tmpdir(), 'logCliTestRuns'))
process.env.LOG_RUNS_DIR ??= join(scratch, 'runs')
process.env.LOG_UNSAVED_DIR ??= join(scratch, 'runs', 'unsaved')
process.env.LOG_CAPTURES_ROOT ??= scratch
