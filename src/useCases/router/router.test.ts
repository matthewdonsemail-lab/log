import { describe, expect, test } from 'bun:test'
import { listUseCases } from '../../mcp/server/helpers/index.ts'
import { matchPlays, playMatchText } from './client'

const useCases = listUseCases()
const top = (prompt: string) => matchPlays(prompt, useCases)[0]?.id

describe('matchPlays', () => {
  test("matt's prompts from 2026-11-07 land on the play he meant", () => {
    expect(top('message the people who are new to following me')).toBe('twitter/replyGuyFunnel')
    expect(top('you are meant to reply guy them first and foremost, send a meme to the tweet')).toBe('twitter/replyGuyFunnel')
    expect(top('go through all the people there who need a message and get them to retweet the thing')).toBe('twitter/getTheAction')
  })

  test('his other plays are found from his own words', () => {
    expect(top('read my instagram dms')).toBe('instagram/dmReply')
    expect(top('send a vn to the group saying we are live')).toBe('inbox/voiceNote')
    expect(top('/rea-looksmaxxing how clavicular gets paid')).toBe('inbox/reaLooksmaxxing')
  })

  test('a prompt about code, or about nothing, matches no play', () => {
    expect(matchPlays('fix the typecheck error in the site', useCases)).toEqual([])
    expect(matchPlays('ok', useCases)).toEqual([])
  })

  test('the text says to load the top play with getGuide', () => {
    const text = playMatchText(matchPlays('message the people who are new to following me', useCases))
    expect(text).toContain('>>> PLAY MATCH')
    expect(text).toContain('getGuide({ useCase: "twitter/replyGuyFunnel" })')
  })
})
