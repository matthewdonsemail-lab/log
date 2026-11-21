import { afterAll, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../../storage/schema/index'
import { buildGraph } from '../graph/index'
import { runMachine } from '../../mcp/apps/report/client'
import { RELATE_INPUT } from '../../cli/relate/index'
import { MACHINE_NOW, MACHINE_TARGET, seedMachineWorld } from './fixtures/machineWorld'
import { MACHINE_BLOCK, MACHINE_FORMS, machineGenuiBlock, relateMachine } from './index'
import type { MachineAnswer, StateMachineBlock } from './index'

const root = join(import.meta.dir, '..', '..', '..')
const load = <T>(...parts: string[]): Promise<T> => import(join(...parts)) as Promise<T>
const genuiWeb = join(root, 'vendor', 'hermesGenui', 'web', 'src')
const { blockEntry, registerBlock } = await load<{ blockEntry: (type: unknown) => unknown; registerBlock: (type: string, entry: unknown) => boolean }>(genuiWeb, 'registry.tsx')
const { readBlocksNoted } = await load<{ readBlocksNoted: (data: unknown) => { blocks: { type: string }[]; dropped: { path: string; why: string }[] } }>(genuiWeb, 'core', 'readBlocks.ts')
const { MACHINE_GENUI_ENTRY } = await load<{ MACHINE_GENUI_ENTRY: unknown }>(root, 'src', 'mcp', 'apps', 'report', 'view', 'genuiMachine.tsx')
const scratch = mkdtempSync(join(tmpdir(), 'relateMachineGenui-'))
const world = join(scratch, 'log.db')
seedMachineWorld(openDatabase(world))
buildGraph(world, new Date(MACHINE_NOW))
afterAll(() => {
  openDatabase(world).close()
  Bun.gc(true)
  rmSync(scratch, { recursive: true, force: true })
})

const blockOf = (answer: MachineAnswer): StateMachineBlock => {
  if (!answer.ok) throw new Error(`${answer.code}: ${answer.problem}`)
  return machineGenuiBlock(answer.block)
}

const BROKEN = { type: MACHINE_BLOCK, states: [{ id: 'a', label: 'A' }], transitions: [{ id: 't', from: 'a', to: 'nowhere', event: 'go' }] }

const python = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', 'import httpx'], { windowsHide: true }).status === 0

describe('the stateMachine block in Hermes GenUI', () => {
  test('every view explains each state, and the genui form leaves out the per-platform copies', async () => {
    for (const ask of [{ person: 'ivy_ops' }, { to: MACHINE_TARGET }, { view: 'network' as const }]) {
      const answer = await relateMachine(ask, world, MACHINE_NOW)
      const block = blockOf(answer)
      expect(block.type).toBe(MACHINE_BLOCK)
      expect(block.platforms).toBeUndefined()
      for (const state of block.states) expect(state.explain?.length).toBeGreaterThan(0)
    }
    const person = blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
    expect(person.states.find((s) => s.current)?.explain).toContain('You stand here')
  })

  test('registers as a GenUI block type that reads a good machine and drops a broken one with the reason', async () => {
    expect(registerBlock(MACHINE_BLOCK, MACHINE_GENUI_ENTRY)).toBe(true)
    expect(registerBlock(MACHINE_BLOCK, MACHINE_GENUI_ENTRY)).toBe(false)
    expect(registerBlock('chart', MACHINE_GENUI_ENTRY)).toBe(false)
    expect(blockEntry(MACHINE_BLOCK)).toBeDefined()
    const good = blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
    const read = readBlocksNoted({ blocks: [{ type: 'text', text: 'Where you stand' }, good, BROKEN] })
    expect(read.blocks.map((b) => b.type)).toEqual(['text', MACHINE_BLOCK])
    expect(read.dropped).toHaveLength(1)
    expect(read.dropped[0].why).toContain('no state has id "nowhere"')
  })

  test('relateMachine form genui returns the block to pass to show_blocks', async () => {
    expect(RELATE_INPUT.forms.find((f) => f.words[0] === 'machine')?.flags.find((f) => f.name === 'form')).toMatchObject({ kind: 'enum', values: MACHINE_FORMS })
    const before = process.env.LOG_DB
    process.env.LOG_DB = world
    try {
      const result = await runMachine({ person: 'ivy_ops', form: 'genui' }, false)
      const block = (result.structuredContent as { block: StateMachineBlock }).block
      expect(block.type).toBe(MACHINE_BLOCK)
      expect(block.states.every((s) => s.explain)).toBe(true)
      const text = (result.content[0] as { text: string }).text
      expect(JSON.parse(text.slice(text.indexOf('{"type"')))).toEqual(block)
      expect((await runMachine({ person: 'ivy_ops', form: 'poster' }, false)).isError).toBe(true)
    } finally {
      if (before === undefined) delete process.env.LOG_DB
      else process.env.LOG_DB = before
    }
  })

  test('the shipped Desktop bundle registers the block before GenUI and carries the stacking frame', () => {
    const bundle = readFileSync(join(root, 'hermesPlugin', 'desktop', 'plugin.js'), 'utf8')
    expect(bundle).toContain('"stateMachine"')
    expect(bundle).toContain('.rmFrame{container-type:inline-size}')
    expect(bundle).toContain('.rmExplain{')
  })

  test.skipIf(!python)('the Python half checks it, reads it as text and lists it in show_blocks', async () => {
    const good = blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
    const boards = join(scratch, 'boards.json')
    writeFileSync(boards, JSON.stringify({ good: [{ type: 'text', text: 'hi' }, good], broken: [{ ...BROKEN, colour: 'red' }] }))
    const plugin = join(root, 'hermesPlugin', '__init__.py')
    const script = [
      'import importlib.util, json, os, sys',
      `os.environ["LOG_ROOT"] = ${JSON.stringify(root)}`,
      `spec = importlib.util.spec_from_file_location("logHooksMachine", ${JSON.stringify(plugin)})`,
      'module = importlib.util.module_from_spec(spec)',
      'spec.loader.exec_module(module)',
      'class Ctx:',
      '    def __init__(self): self.schemas = {}',
      '    def register_tool(self, **k): self.schemas[k["name"]] = k["schema"]',
      '    def register_hook(self, *a, **k): pass',
      '    def register_skill(self, *a, **k): pass',
      '    def register_system_prompt_section(self, *a, **k): pass',
      '    def dispatch_tool(self, *a, **k): return None',
      'ctx = Ctx()',
      'loaded = module.register_genui(ctx)',
      'genui = sys.modules[module.GENUI_PACKAGE]',
      'from importlib import import_module',
      'check = import_module(module.GENUI_PACKAGE + ".core.check")',
      'fallback = import_module(module.GENUI_PACKAGE + ".hooks.text_fallback")',
      `boards = json.load(open(${JSON.stringify(boards)}, encoding="utf-8"))`,
      'print(json.dumps({"loaded": loaded, "good": check.check_blocks(boards["good"]), "broken": check.check_blocks(boards["broken"]), "text": fallback.blocks_as_text(boards["good"]), "listed": "stateMachine:" in ctx.schemas["show_blocks"]["description"]}))',
    ].join('\n')
    const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', script], { encoding: 'utf8', windowsHide: true, env: { ...process.env, LOG_INBOX_STATE: scratch } })
    const out = JSON.parse(run.stdout.trim().split('\n').pop() ?? '{}') as { loaded: boolean; good: string[]; broken: string[]; text: string; listed: boolean }
    expect(out.loaded).toBe(true)
    expect(out.good).toEqual([])
    expect(out.broken).toEqual(expect.arrayContaining(['0.transitions.0.to: no state has id "nowhere"', '0.colour: not a field of a stateMachine block']))
    expect(out.text).toContain(good.states.find((s) => s.current)!.explain!)
    expect(out.listed).toBe(true)
  }, 60_000)
})
