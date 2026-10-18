// Funnel events for Google Tag Manager (GTM-PGJ4QDZC). Each push is a named dataLayer event that the
// container's "GA4 - funnel events" tag forwards to GA4 (G-VL1WDMNEER) with the same name and params.
// The names and params match ui-kit's member sites (memberSites/engine/track.ts) so Log and the resumes
// report into the same rows; the hostname tells them apart.

type Params = Record<string, string | number | undefined>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...params })
  } catch {
    // Analytics must never break the page.
  }
}

/** The gg join form, with UTM tags so gg (and the Whop entry it creates) know which funnel sent them. */
export function ggJoinUrl(medium: string, campaign: string) {
  const q = new URLSearchParams({ utm_source: 'log', utm_medium: medium, utm_campaign: campaign })
  return `https://gg.listeningkit.com/?${q}#apply`
}

/** Seconds played summed over the played ranges, so seeking ahead does not count. */
export function playedSeconds(played: TimeRanges) {
  let total = 0
  for (let i = 0; i < played.length; i++) total += played.end(i) - played.start(i)
  return total
}

/**
 * The same video events the gg page sends (its GTM listener): autoplay start, play with sound, unmute,
 * progress at 10/25/50/75/90% with sound on or off, and complete. One tracker per player instance.
 */
export function videoTracker(videoTitle: string) {
  const sent = new Set<string>()
  const once = (key: string, event: string, el: HTMLVideoElement, extra: Params = {}) => {
    if (sent.has(key)) return
    sent.add(key)
    track(event, {
      video_title: videoTitle,
      video_sound: el.muted || el.volume === 0 ? 'off' : 'on',
      video_seconds: Math.round(el.currentTime || 0),
      ...extra,
    })
  }
  const sound = (el: HTMLVideoElement) => (el.muted || el.volume === 0 ? 'off' : 'on')
  return {
    play(el: HTMLVideoElement) {
      if (el.muted) once('autoplay', 'video_autoplay_start', el)
      else once('play', 'video_play_with_sound', el)
    },
    volume(el: HTMLVideoElement) {
      if (!el.muted && el.volume > 0) once('unmuted', 'video_unmuted', el)
    },
    time(el: HTMLVideoElement) {
      if (!el.duration) return
      const pct = (el.currentTime / el.duration) * 100
      for (const mark of [10, 25, 50, 75, 90]) {
        if (pct >= mark) once(`p${mark}${sound(el)}`, 'video_progress', el, { video_percent: mark })
      }
    },
    ended(el: HTMLVideoElement) {
      once('complete', 'video_complete', el, { video_percent: 100 })
    },
  }
}
