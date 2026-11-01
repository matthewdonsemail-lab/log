import type { WatermarkReading } from '../watermark/types'
export interface VoiceEvidence {
  chat: string
  profile: unknown
  replies: { said: string; reply: string; chat: string; tier: string }[]
  wording?: { reply: string; chat: string; tier: string }[]
  recent?: { said: string; reply: string }[]
}

export interface VoiceDraft {
  to: string
  text: string
  context?: string
  evidence?: VoiceEvidence
}

export interface VoiceReading {
  to: string
  voice: number
  inContext: number
  friendLike: number
  openerOnly: number
  toThem: number | null
  neverSays: string[]
  watermark: WatermarkReading
  pass: boolean
  model: string | null
}

export const VOICE_PASS = 0.8
export const CONTEXT_PASS = 0.7
export const VOICE_MODEL = 'subq-snap-1.1'

export const NEVER_SAYS: readonly string[] = [
  'hit home', 'big swing', 'is mental', 'spot on', 'felt that', 'mad stat', 'hell of a', 'criminally',
  'going straight in my notes', 'the bit most people skip', 'is the whole game', 'is the dream', 'is the good stuff',
  'is rare', 'smart hook', 'make some paper together', 'reckon we could do something together',
  'finish each others sentences', 'proper package',
]

export const MATT_DMS: readonly string[] = [
  'yo saw you were following me lad cheers mate been using blitz like it think its pretty cool saw it got added to treg as well also pretty cool weve been making these videos about 430000 views in the past 2 months just from talking about treg would be cool to talk about blitz might be pretty good for you boys just to get a bit of video content to help educate the audience',
  'yo whats that thing youre doing to be able to queue 163 tweets thats pretty hectic we build out the same kind of stuff maybe it could be cool to plug that into what were doing but weve built a lot of it more for social first platforms so just curious what is it youre doing it for',
  'we run our stuff dynamically out of our crm thats how we do these dynamic pages and then we monitor and measure the results based off of the clicks',
]
