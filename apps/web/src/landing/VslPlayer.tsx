import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { useEffect, useRef } from 'react'
import { MediaPlayer, MediaProvider, Poster, type MediaPlayerInstance } from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'

/** The go getters VSL and its poster, streamed from listeningkit.com (46 MB, so not copied into this repo). */
export const VSL_VIDEO = 'https://listeningkit.com/member-sites/gg/vsl.mp4'
export const VSL_POSTER = 'https://listeningkit.com/member-sites/gg/vsl-poster.jpg'

/** Where the visitor got to, so the video carries on from there when the modal opens again. */
const TIME_KEY = 'lk:vsl:time'

function savedTime() {
  try {
    return Number(window.sessionStorage.getItem(TIME_KEY)) || 0
  } catch {
    return 0
  }
}

function saveTime(seconds: number) {
  try {
    window.sessionStorage.setItem(TIME_KEY, String(Math.floor(seconds)))
  } catch {
    // Private mode: the video just starts from the top next time.
  }
}

/** Seconds of the video actually played, summed over the played ranges, so seeking ahead does not count. */
function playedSeconds(played: TimeRanges) {
  let total = 0
  for (let i = 0; i < played.length; i++) total += played.end(i) - played.start(i)
  return total
}

/**
 * The gg page's player (ui-kit memberSites/engine/VslPlayer.tsx): vidstack's default layout in the brand
 * blue, square corners, autoplaying muted because phones block autoplay with sound. `onWatched` reports
 * how many seconds have really been played, for the modal's watch-a-little gate.
 *
 * It keeps its place: when someone taps "save my spot" and the gg page opens in another tab, the video
 * pauses, and when they come back it carries on from the same second. The position is also kept for
 * the session, so reopening the modal resumes instead of starting over.
 */
export default function VslPlayer({ onWatched }: { onWatched?: (seconds: number) => void }) {
  const player = useRef<MediaPlayerInstance>(null)
  const resumeOnReturn = useRef(false)
  const restored = useRef(false)
  // Read once, before the first time update (at 0:00) can overwrite it.
  const startAt = useRef<number | null>(null)
  if (startAt.current === null) startAt.current = savedTime()

  useEffect(() => {
    const onVisibility = () => {
      const p = player.current
      if (!p) return
      if (document.visibilityState === 'hidden') {
        resumeOnReturn.current = !p.paused
        if (!p.paused) p.pause()
        saveTime(p.currentTime)
      } else if (resumeOnReturn.current) {
        resumeOnReturn.current = false
        void p.play().catch(() => {
          // A browser that refuses the play keeps the paused frame; the play button still works.
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <MediaPlayer
      ref={player}
      src={{ src: VSL_VIDEO, type: 'video/mp4' }}
      title="go getters"
      playsInline
      autoPlay
      muted
      aspectRatio="16/9"
      load="visible"
      onCanPlay={() => {
        // Carry on from where they were, once, as soon as the video can play.
        if (restored.current || !player.current) return
        restored.current = true
        const t = startAt.current ?? 0
        if (t > 0) player.current.currentTime = t
      }}
      onTimeUpdate={(detail) => {
        // Only save once the old position has been restored, or the opening 0:00 would replace it.
        if (restored.current) saveTime(detail.currentTime)
        onWatched?.(playedSeconds(detail.played))
      }}
      className="overflow-hidden bg-black shadow-[0_0_22px_rgba(42,140,255,.55),0_0_4px_rgba(42,140,255,.35)]"
      style={{ '--video-brand': 'rgb(42,140,255)', '--video-border-radius': '0', '--video-border': 'none' }}
    >
      <MediaProvider>
        <Poster className="vds-poster" src={VSL_POSTER} alt="matt on the go getters call" />
      </MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}
