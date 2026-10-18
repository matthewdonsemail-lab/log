import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { useEffect, useRef } from 'react'
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import { playedSeconds, videoTracker } from './track'

/** The go getters VSL and its poster, streamed from listeningkit.com (46 MB, so not copied into this repo). */
export const VSL_VIDEO = 'https://listeningkit.com/member-sites/gg/vsl.mp4'
export const VSL_POSTER = 'https://listeningkit.com/member-sites/gg/vsl-poster.jpg'

/**
 * The gg page's player (ui-kit memberSites/engine/VslPlayer.tsx): vidstack's default layout in the brand
 * blue, square corners, autoplaying muted because phones block autoplay with sound. `onWatched` reports
 * how many seconds have really been played, for the modal's watch-a-little gate.
 */
export default function VslPlayer({
  onWatched,
  videoTitle = 'gg vsl (log)',
}: {
  onWatched?: (seconds: number) => void
  /** Sent with every video event, so GA4 can tell this player from the gg page's own. */
  videoTitle?: string
}) {
  const wrap = useVideoEvents(videoTitle)
  return (
    <div ref={wrap}>
    <MediaPlayer
      src={{ src: VSL_VIDEO, type: 'video/mp4' }}
      title="go getters"
      playsInline
      autoPlay
      muted
      aspectRatio="16/9"
      load="visible"
      onTimeUpdate={(detail) => onWatched?.(playedSeconds(detail.played))}
      className="overflow-hidden bg-black shadow-[0_0_22px_rgba(42,140,255,.55),0_0_4px_rgba(42,140,255,.35)]"
      style={{ '--video-brand': 'rgb(42,140,255)', '--video-border-radius': '0', '--video-border': 'none' }}
    >
      <MediaProvider>
        <Poster className="vds-poster" src={VSL_POSTER} alt="matt on the go getters call" />
      </MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
    </div>
  )
}

/** Media events don't bubble, so they're caught on the way down (capture) at a wrapper round the player. */
function useVideoEvents(videoTitle: string) {
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = wrap.current
    if (!root) return
    const t = videoTracker(videoTitle)
    const on = (fn: (el: HTMLVideoElement) => void) => (e: Event) => {
      if (e.target instanceof HTMLVideoElement) fn(e.target)
    }
    const handlers: Array<[string, (e: Event) => void]> = [
      ['play', on(t.play)],
      ['volumechange', on(t.volume)],
      ['timeupdate', on(t.time)],
      ['ended', on(t.ended)],
    ]
    for (const [name, fn] of handlers) root.addEventListener(name, fn, true)
    return () => {
      for (const [name, fn] of handlers) root.removeEventListener(name, fn, true)
    }
  }, [videoTitle])
  return wrap
}
