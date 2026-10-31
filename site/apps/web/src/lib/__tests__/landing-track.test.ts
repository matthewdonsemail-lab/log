import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ggJoinUrl, track, videoTracker } from '../../landing/track'

// The suite runs in Node, so give track() a window with a dataLayer to push to.
let layer: Array<Record<string, unknown>>
beforeEach(() => {
  layer = []
  vi.stubGlobal('window', { dataLayer: layer })
})
afterEach(() => { vi.unstubAllGlobals() })

describe('funnel events for GTM', () => {
  it('pushes a named dataLayer event with its params', () => {
    track('repo_modal_open', { repo: 'log', open_trigger: 'click' })
    expect(layer).toEqual([{ event: 'repo_modal_open', repo: 'log', open_trigger: 'click' }])
  })

  it('tags gg links with the funnel they came from and keeps the form anchor', () => {
    expect(ggJoinUrl('repo_modal', 'join_bar')).toBe(
      'https://gg.listeningkit.com/?utm_source=log&utm_medium=repo_modal&utm_campaign=join_bar#apply',
    )
  })
})

describe('video events', () => {
  const video = (o: Partial<HTMLVideoElement>) => ({ muted: true, volume: 1, currentTime: 0, duration: 570, ...o }) as HTMLVideoElement

  it('sends each milestone once, split by sound on and off', () => {
    const t = videoTracker('gg vsl (log repo modal)')
    t.play(video({}))
    t.play(video({}))
    t.time(video({ currentTime: 150 }))
    t.volume(video({ muted: false, currentTime: 150 }))
    t.time(video({ muted: false, currentTime: 150 }))
    t.time(video({ muted: false, currentTime: 151 }))
    expect(layer.map((e) => [e.event, e.video_percent ?? '', e.video_sound])).toEqual([
      ['video_autoplay_start', '', 'off'],
      ['video_progress', 10, 'off'],
      ['video_progress', 25, 'off'],
      ['video_unmuted', '', 'on'],
      ['video_progress', 10, 'on'],
      ['video_progress', 25, 'on'],
    ])
    expect(layer.every((e) => e.video_title === 'gg vsl (log repo modal)')).toBe(true)
  })
})
