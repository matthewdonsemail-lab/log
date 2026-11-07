import { RepoLink } from '../RepoLink'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useInView } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faInstagram, faReddit, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

type Thread = { who: string; text: string }

type Wall = { icon: IconDefinition; where: string; card: string; name: string; text: string; muted: string; bubble?: string; ring?: boolean; threads: Thread[] }

const PLUGS = [
  { label: 'Claude', src: '/logos/tools/claude-desktop.svg' },
  { label: 'Codex', src: '/logos/tools/chatgpt.svg' },
  { label: 'Cursor', src: '/logos/tools/cursor.svg' },
]

function BlueMark({ src, className }: { src: string; className: string }) {
  const mask: CSSProperties = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  }
  return <span aria-hidden className={`block bg-[#2A8CFF] ${className}`} style={mask} />
}

const HAND = { fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }
const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const TONES = ['#E01E5A', '#2EB67D', '#ECB22E', '#8E5CF7', '#F2683A', '#1D9BF0']

const WALLS: Record<string, Wall> = {
  slack: {
    icon: faSlack,
    where: 'growth-co',
    card: 'bg-white ring-1 ring-[#DDDDDD]',
    name: 'text-[#1D1C1D]',
    text: 'text-[#1D1C1D]',
    muted: 'text-[#616061]',
    threads: [
      { who: 'Priya', text: 'anyone know someone who can fix our onboarding emails? happy to pay' },
      { who: 'Tom', text: 'we need help with ads asap, the budget is there' },
      { who: 'Jay', text: 'who did your landing page? ours converts terribly' },
      { who: 'Sam', text: 'still looking for someone to run our outbound, any recs?' },
      { who: 'Leah', text: 'our agency ghosted us mid launch, need someone this week' },
      { who: 'Omar', text: 'does anyone do cold email properly? paying well' },
      { who: 'Nina', text: 'drowning in DMs we never answer, need a hand' },
      { who: 'Ben', text: 'who can set up a CRM for us that the team will actually use?' },
      { who: 'Ava', text: 'looking for a freelancer for our socials, starting monday' },
    ],
  },
  discord: {
    icon: faDiscord,
    where: '#help',
    card: 'bg-white ring-1 ring-[#E3E5E8]',
    name: 'text-[#060607]',
    text: 'text-[#313338]',
    muted: 'text-[#5C5E66]',
    threads: [
      { who: 'mila', text: 'our ads stopped working overnight, anyone here fix this for money?' },
      { who: 'deano', text: 'need someone to run our community, paid role' },
      { who: 'kai', text: 'who here does edits? need 10 clips a week' },
      { who: 'rory', text: 'looking for a dev to build our bot, budget ready' },
      { who: 'zee', text: 'can someone audit our funnel? will pay for an hour' },
      { who: 'finn', text: 'anyone know a good designer? our brand looks cheap' },
      { who: 'lux', text: 'need help launching on product hunt next week' },
      { who: 'ivy', text: 'paying for someone to write our newsletter' },
      { who: 'max', text: 'who can get us more sign ups? tried everything' },
    ],
  },
  instagram: {
    icon: faInstagram,
    where: 'Instagram DMs',
    card: 'bg-white ring-1 ring-[#DBDBDB]',
    name: 'text-[#000000]',
    text: 'text-[#000000]',
    muted: 'text-[#737373]',
    bubble: 'mt-1.5 inline-block rounded-[18px] bg-[#EFEFEF] px-3 py-2',
    ring: true,
    threads: [
      { who: 'maya.makes', text: 'do you do custom orders? need one by friday' },
      { who: 'jess.fit', text: 'how much is the coaching? want to start this month' },
      { who: 'tom.builds', text: 'is this still available??' },
      { who: 'lena.home', text: 'saw your reel, can you do this for my shop?' },
      { who: 'chris.eats', text: 'do you ship to the UK? want 3' },
      { who: 'ana.style', text: 'what’s the price for the full package?' },
      { who: 'dev.daily', text: 'can we book a call? want to work with you' },
      { who: 'sara.glow', text: 'hiii do you still have the blue one' },
      { who: 'noah.runs', text: 'how do I sign up?? the link isn’t working' },
    ],
  },
  x: {
    icon: faXTwitter,
    where: 'X',
    card: 'bg-white ring-1 ring-[#EFF3F4]',
    name: 'text-[#0F1419]',
    text: 'text-[#0F1419]',
    muted: 'text-[#536471]',
    threads: [
      { who: 'dana_builds', text: 'need a designer for a quick project, DMs open' },
      { who: 'leo_ops', text: 'just hit 10 clients and drowning, anyone do ops?' },
      { who: 'priya_ships', text: 'who’s the best person for cold outbound right now?' },
      { who: 'kai_agency', text: 'looking for someone to run our X, paying properly' },
      { who: 'mira_ugc', text: 'brands, I’m booked out, who else does UGC?' },
      { who: 'tomfounds', text: 'what tool do you use for DMs at scale? need one' },
      { who: 'sam_designs', text: 'hiring a growth person this week, send me yours' },
      { who: 'ory_ai', text: 'anyone want to collab on a launch? have budget' },
      { who: 'jess_writes', text: 'need a ghostwriter, 3 posts a week, rates?' },
    ],
  },
  reaLooksmaxxing: {
    icon: faDiscord,
    where: 'Discord DMs',
    card: 'bg-white ring-1 ring-[#E3E5E8]',
    name: 'text-[#060607]',
    text: 'text-[#313338]',
    muted: 'text-[#5C5E66]',
    threads: [
      { who: 'mogger_420', text: 'how do i look like that' },
      { who: 'gymcel_99', text: 'what does he eat in a day bro' },
      { who: 'lookscope_ana', text: 'is this ai' },
      { who: 'jawline_jay', text: 'where do i sign up for the program' },
      { who: 'mewing_max', text: 'is the morning routine in the discord?' },
      { who: 'chadlite_k', text: 'how much is the coaching' },
      { who: 'ice_face_tom', text: 'facial icing actually works??' },
      { who: 'softmaxx_li', text: 'link in bio is broken, where do i join' },
      { who: 'ascend_eli', text: 'bro i need this, how do i start' },
    ],
  },
  reddit: {
    icon: faReddit,
    where: 'r/smallbusiness',
    card: 'bg-white ring-1 ring-[#EDEFF1]',
    name: 'text-[#1A1A1B]',
    text: 'text-[#1A1A1B]',
    muted: 'text-[#7C7C7C]',
    threads: [
      { who: 'u/firstshop', text: 'How did you find your first customers? I’m stuck at zero.' },
      { who: 'u/plumbpro', text: 'Paid an agency for 6 months, got nothing. Who actually helps?' },
      { who: 'u/bakeryowner', text: 'Is there anyone who does local marketing that works?' },
      { who: 'u/saasfounder', text: 'Need someone to run outreach, happy to pay per meeting.' },
      { who: 'u/cleanco', text: 'Our website gets traffic but nobody books. Help?' },
      { who: 'u/coachjen', text: 'Looking for someone to manage my socials, budget ready.' },
      { who: 'u/printshop', text: 'What’s worked for you to get repeat customers?' },
      { who: 'u/devstudio', text: 'Who here does cold email well? Hiring.' },
      { who: 'u/gymowner', text: 'Recommend a marketer who answers the phone?' },
    ],
  },
}

function ThreadCard({ thread, wall }: { thread: Thread; wall: Wall }) {
  return (
    <div className="pointer-events-none flex min-w-0 text-left">
      <div className={`flex w-full gap-3 rounded-2xl p-4 shadow-[0_8px_24px_-12px_rgba(13,42,76,0.25)] ${wall.card}`}>
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full ${wall.ring ? 'p-[2px]' : ''}`}
          style={wall.ring ? { backgroundImage: 'linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)' } : undefined}
        >
          <span
            className={`grid size-full place-items-center rounded-full text-[14px] font-black text-white ${wall.ring ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: TONES[thread.who.length % TONES.length] }}
          >
            {thread.who.replace(/^u\//, '').charAt(0).toUpperCase()}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`truncate text-[14px] font-bold ${wall.name}`}>{thread.who}</span>
            <span className={`text-[12px] ${wall.muted}`}>· {wall.where}</span>
            <FontAwesomeIcon icon={wall.icon} className={`ml-auto text-[13px] ${wall.muted}`} />
          </div>
          {wall.bubble ? (
            <span className={`text-[15px] leading-snug ${wall.text} ${wall.bubble}`}>{thread.text}</span>
          ) : (
            <p className={`mt-1 text-[15px] leading-snug ${wall.text}`}>{thread.text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function PlatformMoney({
  platformId,
  platformLabel,
  ctaHref,
  embed,
  title,
  subline,
}: {
  platformId: string
  platformLabel: string
  ctaHref: string
  embed?: ReactNode
  title?: ReactNode
  subline?: ReactNode
}) {
  const wall = WALLS[platformId] ?? WALLS.x
  const ref = useRef<HTMLElement>(null)
  const on = useInView(ref, { margin: '200px' })
  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-white px-6 py-24 text-center sm:px-10 sm:py-36">
      <div
        aria-hidden="true"
        className="lk-card-wall pointer-events-none absolute inset-x-0 top-0 hidden flex-col md:flex"
        style={{ animationPlayState: on ? 'running' : 'paused' }}
      >
        {Array.from({ length: 24 }, (_, row) => (
          <div key={row} className="grid h-[7.25rem] w-full grid-cols-3 items-center gap-4 px-4">
            {[0, 1, 2].map((column) => (
              <ThreadCard key={`${row}-${column}`} thread={wall.threads[(row * 3 + column) % wall.threads.length]} wall={wall} />
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(255,255,255,0.86)_70%,#fff_94%)]" />
      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-7rem] -z-10 rounded-[6rem] bg-white blur-2xl"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 42%, rgba(0,0,0,0.9) 68%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 42%, rgba(0,0,0,0.9) 68%, transparent 100%)',
          }}
        />
        {embed ?? <img src="/logo.svg" alt="ListeningKit logo" className="size-24 rounded-[22%] object-contain sm:size-32" />}
        <h2 className="mt-8 max-w-4xl text-5xl leading-[1.05] text-[#0D2A4C] sm:text-7xl" style={HAND}>
          {title ?? (
            <>
              There&apos;s literally <span className={STICKER}>so much money</span> sitting on your <span className={STICKER}>{platformLabel}</span>
            </>
          )}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-2xl leading-snug text-[#0D2A4C]/80 sm:text-3xl" style={HAND}>
          {subline ?? (
            <>
              I&apos;m begging and crying you, set up log and just <span className={STICKER}>get after it</span>
            </>
          )}
        </p>
        <RepoLink
          href={ctaHref}
          className="button-glow mt-10 inline-flex items-center gap-2 rounded-xl border border-white/35 px-8 py-5 text-xl font-bold uppercase text-white"
        >
          Set up log
          <FontAwesomeIcon icon={faArrowRight} className="text-[16px]" />
        </RepoLink>
      </div>
    </section>
  )
}

export function LogWith() {
  return (
    <section aria-label="log with your agent" className="relative w-full px-4 pb-8 pt-4 md:px-6 md:pb-12">
      <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sticker-word text-[2.5rem] leading-none sm:text-[4rem] lg:text-[4.75rem]">
        /log with
        <span className="flex items-center gap-3 sm:gap-4">
          {PLUGS.map((plug) => (
            <span key={plug.label} title={plug.label}>
              <BlueMark src={plug.src} className="size-9 sm:size-14 lg:size-16" />
            </span>
          ))}
        </span>
      </p>
    </section>
  )
}
