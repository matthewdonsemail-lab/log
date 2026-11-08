import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const PROXY = 'src/mcp/reload/client.ts'
const MESSAGE = 'src/mcp/reload/helpers/message.ts'
const BIN = 'bin/logMcp.ts'
const FRESHNESS = 'src/mcp/freshness/client.ts'

export const mcpReload = {
  description: 'The log MCP server reloads its code under a proxy that never exits, waiting for calls and jobs, so Claude Code is never restarted for new code',
  specPath: 'docs/specs/mcpReload.md',
  codePaths: [PROXY, MESSAGE, BIN, FRESHNESS],
  anchors: {
    'REQ-RELOAD-01': [
      { kind: 'symbol', file: PROXY, name: 'runReloadProxy' },
      { kind: 'symbol', file: PROXY, name: 'ReloadProxy' },
      { kind: 'uses', file: BIN, name: 'runReloadProxy' },
      { kind: 'string', file: BIN, includes: '--child' },
    ],
    'REQ-RELOAD-02': [
      { kind: 'symbol', file: MESSAGE, name: 'replayedInitialize' },
      { kind: 'symbol', file: MESSAGE, name: 'toolsChanged' },
      { kind: 'uses', file: PROXY, name: 'listJobs' },
      { kind: 'uses', file: PROXY, name: 'codeStampWatcher' },
    ],
    'REQ-RELOAD-03': [
      { kind: 'symbol', file: MESSAGE, name: 'restartedMidCall' },
      { kind: 'string', file: MESSAGE, includes: 'notifications/tools/list_changed' },
    ],
    'REQ-RELOAD-04': [
      { kind: 'symbol', file: PROXY, name: 'reloadStateFile' },
      { kind: 'symbol', file: FRESHNESS, name: 'readProxyState' },
      { kind: 'symbol', file: FRESHNESS, name: 'staleServerLine' },
    ],
  },
  rubrics: {
    'REQ-RELOAD-01': noul('Does bin/logMcp.ts run runReloadProxy unless --child, --http or LOG_MCP_RELOAD=off, and does the proxy spawn bin/logMcp.ts --child, forward every line both ways, keep the initialize request, track forwarded requests until answered, and exit only when stdin closes?'),
    'REQ-RELOAD-02': noul('Is reloadDue true only when the cached code stamp (codeStampWatcher, read without walking the tree, refreshed on the timer after a file change or the backstop) is newer than the child stamp, the stamp has not failed before, no request is in flight and no running job has the child pid, recording waitingOn otherwise; and does a reload replay initialize to a new child under its own id, not forward that answer, then send notifications/initialized, kill the old child marked as killed, send notifications/tools/list_changed to the client and flush the queued lines?'),
    'REQ-RELOAD-03': noul('When the child exits unexpectedly, is every in-flight request answered with restartedMidCall and the child restarted with initialize replayed, with restarts stopped after more than 5 crashes in a minute; is a new child that exits or misses initialize within 30 s killed while the old child keeps serving with lastError set and that stamp not retried; and is a request with no child running answered with the same error?'),
    'REQ-RELOAD-04': noul('Does runReloadProxy write the proxy state (pids, child stamp, reloads, waitingOn, lastError) to reloadStateFile and log each reload, and does staleServerLine, through readProxyState, never tell matt to restart while the proxy pid is alive, giving only lastError or waitingOn?'),
    unspecifiedBehavior: noul('Does the proxy ever exit while the client is connected, kill a child while a call or job runs in it on a code change, swallow a client request without an answer, or forward the replayed initialize answer to the client, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-RELOAD-01': MET,
    'REQ-RELOAD-02': MET,
    'REQ-RELOAD-03': MET,
    'REQ-RELOAD-04': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
