import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { assign, createActor, fromPromise, setup } from 'xstate'
import { join } from 'node:path'
import { loadUserEnv } from '../../../../src/config/userEnv'

type CheckAccount = { id: string; name: string; platform: string }
type CheckResult = { state: 'succeeded' | 'stopped' | 'unavailable' | 'unknown' }
type Task = { account: CheckAccount; resolve: (result: CheckResult) => void; reject: (error: Error) => void }

export function createAccountChecker(root: string, persist: (id: string, state: string) => void) {
  let client: Client | null = null
  let connecting: Promise<Client> | null = null
  async function connection() {
    if (client) return client
    if (connecting) return connecting
    connecting = (async () => {
      const env = { ...process.env }; loadUserEnv(env)
      const transport = new StdioClientTransport({ command: process.env.LOG_BUN || 'bun', args: [join(root, 'bin', 'logMcp.ts')], cwd: root, env: Object.fromEntries(Object.entries({ ...env, LOG_ACCOUNTS: 'local' }).filter((entry): entry is [string, string] => typeof entry[1] === 'string')), stderr: 'pipe' })
      const next = new Client({ name: 'logLocalConsole', version: '1' })
      next.onclose = () => { if (client === next) client = null }
      transport.stderr?.on('data', () => {})
      try {
        await next.connect(transport)
        await next.callTool({ name: 'getGuide', arguments: { topic: 'logMcpInstructions' } })
        await next.callTool({ name: 'getGuide', arguments: { topic: 'logCatalog' } })
        client = next
        return next
      } catch (error) { await next.close().catch(() => {}); throw error }
    })()
    try { return await connecting } finally { connecting = null }
  }
  function normalise(result: Record<string, unknown>) {
    return { isError: result.isError === true, structuredContent: result.structuredContent && typeof result.structuredContent === 'object' && !Array.isArray(result.structuredContent) ? result.structuredContent as Record<string, unknown> : undefined }
  }
  async function finish(rpc: Client, initial: Record<string, unknown>) {
    const result = normalise(initial)
    const job = result.structuredContent?.job as { id?: string; afterLine?: number } | undefined
    if (!job?.id) return result
    const until = Date.now() + 300000
    let afterLine = job.afterLine ?? 0
    while (Date.now() < until) {
      const next = normalise(await rpc.callTool({ name: 'jobStatus', arguments: { jobId: job.id, afterLine, waitMs: 10000, json: true } }, undefined, { timeout: 20000 }))
      const view = (next.structuredContent?.json as { job?: { status?: string; afterLine?: number; result?: Record<string, unknown> } } | undefined)?.job
      if (!view) return { isError: true, structuredContent: { ok: false, job: { id: job.id, status: 'unknown' } } }
      afterLine = view.afterLine ?? afterLine
      if (view.status === 'completed' || view.status === 'failed') {
        const { job: terminalJob, ...content } = view.result ?? {}
        console.info('[browserCheck] runtime job finished', { status: view.status, exit: content.exit ?? null })
        return { isError: view.status !== 'completed' || content.ok === false, structuredContent: content }
      }
      if (view.status !== 'running') return { isError: true, structuredContent: { ok: false, job: { id: job.id, status: view.status } } }
      console.info('[browserCheck] runtime job pending', { status: view.status, remainingSeconds: Math.max(0, Math.round((until - Date.now()) / 1000)) })
    }
    return { isError: true, structuredContent: { ok: false, job: { id: job.id, status: 'unknown' } } }
  }
  async function catalogCall(id: string, inputs: Record<string, unknown>, live = false) {
    const rpc = await connection()
    await rpc.callTool({ name: 'getGuide', arguments: { topic: 'facebookBrowser' } })
    const contract = await rpc.callTool({ name: 'logGet', arguments: { id } })
    if (contract.isError || (contract.structuredContent as { ok?: boolean } | undefined)?.ok === false) throw new Error('browserOperationUnsupported')
    return finish(rpc, await rpc.callTool({ name: 'logCall', arguments: { id, inputs, ...(live ? { live: true, confirmLive: true } : {}), waitMs: 300000 } }, undefined, { timeout: 310000 }))
  }
  async function toolCall(name: string, inputs: Record<string, unknown>) {
    const rpc = await connection()
    await rpc.callTool({ name: 'getGuide', arguments: { topic: 'facebookBrowser' } })
    return finish(rpc, await rpc.callTool({ name, arguments: inputs }, undefined, { timeout: 310000 }))
  }
  const machine = setup({
    types: { context: {} as { task: Task | null }, events: {} as { type: 'CHECK'; task: Task } },
    actors: { check: fromPromise(async ({ input }: { input: Task }): Promise<CheckResult> => {
      persist(input.account.id, 'running')
      let dispatched = false
      try {
        const rpc = await connection()
        if (input.account.platform === 'facebook') throw new Error('browserCheckRequired')
        const id = `${input.account.platform}.session.check`
        await rpc.callTool({ name: 'getGuide', arguments: { topic: input.account.platform === 'twitter' ? 'xAccount' : input.account.platform === 'facebook' ? 'facebookBrowser' : input.account.platform } })
        const contract = await rpc.callTool({ name: 'logGet', arguments: { id } })
        if (contract.isError) throw new Error('accountCheckUnsupported')
        dispatched = true
        const result = await rpc.callTool({ name: 'logCall', arguments: { id, inputs: { account: input.account.name, json: true } } }, undefined, { timeout: 300000 })
        const content = result.structuredContent as { ok?: boolean; job?: unknown } | undefined
        const state = content?.job ? 'unknown' : result.isError || content?.ok === false ? 'stopped' : content?.ok === true ? 'succeeded' : 'unknown'
        persist(input.account.id, state)
        return { state }
      } catch {
        const state = dispatched ? 'unknown' : 'unavailable'
        persist(input.account.id, state)
        return { state }
      }
    }) },
  }).createMachine({
    id: 'localAccountChecker', initial: 'idle', context: { task: null },
    states: {
      idle: { on: { CHECK: { target: 'checking', actions: assign({ task: ({ event }) => event.task }) } } },
      checking: { invoke: { src: 'check', input: ({ context }) => context.task!, onDone: { target: 'idle', actions: ({ context, event }) => context.task?.resolve(event.output) }, onError: { target: 'idle', actions: ({ context }) => context.task?.reject(new Error('accountCheckUnavailable')) } } },
    },
  })
  const actor = createActor(machine).start()
  return {
    catalogCall, toolCall,
    activeAccountId() { return actor.getSnapshot().matches('checking') ? actor.getSnapshot().context.task?.account.id ?? null : null },
    check(account: CheckAccount) {
      if (!actor.getSnapshot().matches('idle')) return Promise.reject(new Error('accountCheckBusy'))
      return new Promise<CheckResult>((resolve, reject) => actor.send({ type: 'CHECK', task: { account, resolve, reject } }))
    },
    async close() {
      if (!actor.getSnapshot().matches('idle')) {
        await new Promise<void>((resolve) => { const subscription = actor.subscribe((snapshot) => { if (snapshot.matches('idle')) { subscription.unsubscribe(); resolve() } }) })
      }
      await client?.close()
      actor.stop()
    },
  }
}
