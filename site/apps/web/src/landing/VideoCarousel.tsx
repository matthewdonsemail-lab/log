import { lazy, Suspense } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

import { useDragCarousel } from './useDragCarousel'

const VslPlayer = lazy(() => import('./VslPlayer'))

type Video = {
  id: string
  hook: string
  minutes: string
  mp4: string
  poster: string
}

const VIDEOS: Video[] = [
  {
    id: '2110714125777248467',
    hook: 'i found people just like me in 1.52M posts',
    minutes: '9:45',
    mp4: 'https://video.twimg.com/amplify_video/2110713464230752257/vid/avc1/1280x720/8ddZrwwl4aWesHJk.mp4?tag=14',
    poster: 'https://pbs.twimg.com/amplify_video_thumb/2110713464230752257/img/c2qILMZwlUu8CX6U.jpg',
  },
  {
    id: '2110081230318538947',
    hook: 'i analysed 1M tweets in 12 hours',
    minutes: '3:52',
    mp4: 'https://video.twimg.com/amplify_video/2110081013271732224/vid/avc1/1280x720/FLS-hsSi0lvpYiBx.mp4?tag=14',
    poster: 'https://pbs.twimg.com/amplify_video_thumb/2110081013271732224/img/5Pr_XLxApC50iSD6.jpg',
  },
  {
    id: '2097872142704754762',
    hook: 'i built the GTM for a removal company',
    minutes: '6:38',
    mp4: 'https://video.twimg.com/amplify_video/2097871352434933760/vid/avc1/1280x720/O9_efMprqjv6Yuxr.mp4?tag=14',
    poster: 'https://pbs.twimg.com/amplify_video_thumb/2097871352434933760/img/zMjrSIJEvMVI_6uW.jpg',
  },
]

export function DownArrow() {
  return (
    <svg aria-hidden viewBox="0 0 40 40" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="translate-y-2">
      <path d="M8 4 C 26 8, 30 20, 22 34" />
      <path d="M14 27 L 22 35 L 30 27" />
    </svg>
  )
}

function VideoSlide({ video, active }: { video: Video; active: boolean }) {
  return (
    <li className="w-full shrink-0" aria-hidden={!active}>
      <p className="mb-1 flex items-center justify-center gap-1 text-[#2A8CFF]">
        <span className="sticker-word text-3xl">watch how</span>
        <span className="rounded-md bg-[#0D2A4C] px-2 py-1 font-sans text-sm font-black leading-none text-white">{video.minutes}</span>
        <DownArrow />
      </p>
      <p className="mb-2 text-center text-xl text-[#0D2A4C]" style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}>
        {video.hook}
      </p>
      {active ? (
        <Suspense fallback={<div className="aspect-video w-full bg-black" />}>
          <VslPlayer src={video.mp4} poster={video.poster} title={video.hook} alt={video.hook} videoTitle={`x video ${video.id} (log)`} autoPlay={false} />
        </Suspense>
      ) : (
        <img src={video.poster} alt="" className="aspect-video w-full bg-black object-cover" />
      )}
      <a
        href={`https://x.com/matthewsoldit/status/${video.id}`}
        target="_blank"
        rel="noreferrer"
        tabIndex={active ? 0 : -1}
        className="mt-2 flex justify-center text-sm font-bold underline"
        style={{ color: 'var(--lk-muted)' }}
      >
        see the post on x
      </a>
    </li>
  )
}

const ARROW =
  'grid size-10 place-items-center rounded-md bg-[#2A8CFF] text-white shadow-[0_4px_0_var(--lk-brand-deep)] transition-transform active:translate-y-[4px] active:shadow-none disabled:opacity-40'

export function VideoCarousel() {
  const { active, go, drag, viewportProps } = useDragCarousel(VIDEOS.length)
  return (
    <div className="w-full">
      <div {...viewportProps} className={`${viewportProps.className} overflow-hidden`}>
        <ul
          className={`m-0 flex list-none gap-8 p-0 pt-1 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${drag ? '' : 'transition-transform duration-500'}`}
          style={{ transform: `translateX(calc(${-active} * (100% + 2rem) + ${drag}px))` }}
        >
          {VIDEOS.map((video, index) => (
            <VideoSlide key={video.id} video={video} active={index === active} />
          ))}
        </ul>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button type="button" aria-label="Previous video" onClick={() => go(active - 1)} disabled={active === 0} className={ARROW}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="flex items-center gap-2" role="group" aria-label="Choose a video">
          {VIDEOS.map((video, index) => (
            <button
              key={video.id}
              type="button"
              aria-label={video.hook}
              aria-current={index === active}
              onClick={() => go(index)}
              className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${index === active ? 'w-10 bg-[#2A8CFF]' : 'w-2.5 bg-[#2A8CFF]/30 hover:bg-[#2A8CFF]/60'}`}
            />
          ))}
        </div>
        <button type="button" aria-label="Next video" onClick={() => go(active + 1)} disabled={active === VIDEOS.length - 1} className={ARROW}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  )
}
