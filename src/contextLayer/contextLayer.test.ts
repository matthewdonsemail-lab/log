import { describe, expect, test } from 'bun:test'
import { hookAnswer, hookOutput } from './hook/index'
import { playReminder, sessionPlayOf } from './session/index'
import { serviceHookCommand } from './service/index'
import { correctTypos, editDistance, windowsOf } from '../useCases/router/helpers/index'
import { isPrompt, playMatchText } from '../useCases/router/index'

const use = (name: string, input: Record<string, unknown> = {}) => JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: `mcp__log__${name}`, input }] } })

describe('the router hears matt the way he types', () => {
  test('a typo within one or two edits becomes the playbook word, a short word is left alone', () => {
    const vocabulary = new Set(['message', 'retweet', 'voice', 'note', 'group'])
    expect(correctTypos('retweeet the mesage to the grouo', vocabulary).text).toBe('retweet the message to the group')
    expect(editDistance('throguh', 'through', 2)).toBe(1)
    expect(correctTypos('vn', vocabulary).text).toBe('vn')
  })

  test('a long ramble is read as overlapping windows, a short ask as one', () => {
    expect(windowsOf('send a vn to them')).toEqual(['send a vn to them'])
    expect(windowsOf(Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ')).length).toBe(4)
  })

  test('task notifications, system text and summaries are never routed', () => {
    expect(isPrompt('<task-notification> agent finished')).toBe(false)
    expect(isPrompt('This session is being continued from a previous conversation that ran out of context.')).toBe(false)
    expect(isPrompt('check my x dms')).toBe(true)
  })

  test('a confident pick names getGuide; an unsure one asks the model to choose or say none; nothing says nothing', () => {
    const play = { id: 'twitter/dmInbox', title: 'Reading the DM inbox', score: 0.7, phrase: 'x' }
    expect(playMatchText([play])).toContain('getGuide({ useCase: "twitter/dmInbox" })')
    expect(playMatchText([], [play])).toContain('>>> MAYBE A PLAY')
    expect(playMatchText([], [])).toBe('')
  })
})

describe('the play comes back after compaction', () => {
  test("the session's own transcript gives its last loaded play and the last step it ran", () => {
    const transcript = [use('getGuide', { useCase: 'twitter/networkMaxing' }), use('twitterDms', { with: 'a' }), use('getGuide', { useCase: 'twitter/replyGuyFunnel' }), use('twitterReplyLive')].join('\n')
    expect(sessionPlayOf(transcript)).toEqual({ id: 'twitter/replyGuyFunnel', lastTool: 'twitterReplyLive' })
    expect(sessionPlayOf(use('twitterDms'))).toBeNull()
  })

  test('a play loaded with ask is restored from the getGuide answer, and a cleared play is not', () => {
    const ask = (id: string, text: string) => JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name: 'mcp__log__getGuide', input: { ask: text } }] } })
    const answer = (id: string, text: string) => JSON.stringify({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content: [{ type: 'text', text }] }] } })
    const loaded = [ask('t1', 'reply to him on discord'), answer('t1', ">>> PLAY MATCH: x\n\n>>> PLAY discord/channelReply is now this session's play, under the handle play_x"), use('discordRead')].join('\n')
    expect(sessionPlayOf(loaded)).toEqual({ id: 'discord/channelReply', lastTool: 'discordRead' })
    const menu = [use('getGuide', { useCase: 'twitter/followUps' }), ask('t2', 'reply to her'), answer('t2', 'No single use case matches')].join('\n')
    expect(sessionPlayOf(menu)).toEqual({ id: 'twitter/followUps', lastTool: null })
    expect(sessionPlayOf([loaded, use('getGuide', { clearPlay: true })].join('\n'))).toBeNull()
  })

  test('the reminder lists the steps done and to do and says to load it again', () => {
    const page = '# Reply guy\n\n| # | Step | Tool | Done when |\n|---|---|---|---|\n| 1 | Read them | `twitterDms` | read |\n| 2 | Reply | `twitterReplyLive` | sent |\n| 3 | Forward | `twitterDmLive` | sent |\n'
    const text = playReminder({ id: 'twitter/replyGuyFunnel', lastTool: 'twitterReplyLive' }, page)
    expect(text).toContain('>>> ACTIVE PLAY')
    expect(text).toContain('done 2.')
    expect(text).toContain('todo 3.')
    expect(text).toContain('getGuide({ useCase: "twitter/replyGuyFunnel" })')
  })

  test('the hook answers a prompt from the router and stays silent when the service is down', async () => {
    const route = async () => ({ play: { id: 'inbox/voiceNote', title: 'Sending a voice note', score: 0.8, phrase: 'send a vn' } })
    const hit = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt: 'send a vn to the group' }, route)
    expect(hit.outcome).toBe('inbox/voiceNote')
    expect(JSON.parse(hookOutput(hit)).hookSpecificOutput.additionalContext).toContain('inbox/voiceNote')
    const down = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt: 'send a vn to the group' }, async () => null)
    expect(down.outcome).toBe('serviceTimeout')
    expect(hookOutput(down)).toBe('')
  })

  test('the per-prompt hook is one curl to the service, with bun only as the fallback', () => {
    const command = serviceHookCommand('/hook', 'bun x.ts')
    expect(command.startsWith('curl -sf')).toBe(true)
    expect(command.endsWith('|| bun x.ts')).toBe(true)
  })
})
