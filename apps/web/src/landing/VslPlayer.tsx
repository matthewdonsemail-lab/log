import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'

/** The go getters VSL and its poster, streamed from listeningkit.com (46 MB, so not copied into this repo). */
export const VSL_VIDEO = 'https://listeningkit.com/member-sites/gg/vsl.mp4'
export const VSL_POSTER = 'https://listeningkit.com/member-sites/gg/vsl-poster.jpg'

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
 */
export default function VslPlayer({ onWatched }: { onWatched?: (seconds: number) => void }) {
  return (
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
  )
}
