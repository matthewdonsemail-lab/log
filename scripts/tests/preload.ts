/**
 * Loaded before every `bun test` (bunfig.toml). A test that prepares a run
 * writes its folder under a scratch directory, never into the real
 * `~/.logCli/runs`: the profile tests left about 76 `galwayOne` folders there
 * before (2026-10-22, found when the runs filled the disk).
 */
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const scratch = mkdtempSync(join(tmpdir(), 'logCliTestRuns'))
process.env.LOG_RUNS_DIR ??= join(scratch, 'runs')
process.env.LOG_UNSAVED_DIR ??= join(scratch, 'runs', 'unsaved')
