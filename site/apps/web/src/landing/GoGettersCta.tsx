import type { CSSProperties } from 'react'
import { Building2, Rocket, User, Users } from 'lucide-react'
import Dither from '@/components/Dither'
import { GG_REVIEWS } from './ggReviews'
import { HandArrow, ReviewMarquee } from './RepoLink'
import { DownArrow, VideoCarousel } from './VideoCarousel'
import { WhopJoin } from './WhopJoin'
import './RepoModal.css'

const GRADIENT = {
  backgroundImage: 'linear-gradient(180deg, #117EFF -12.71%, #1E88FF 44.69%, #5EA7FF 102.1%)',
  boxShadow: 'inset 0 2px 30px #5EA7FF, 0 4px 0 var(--lk-brand-deep)',
}

const WHO = [
  { name: 'fortune 500 teams', Icon: Building2 },
  { name: 'funded founders', Icon: Rocket },
  { name: 'gtm agencies', Icon: Users },
  { name: 'solopreneurs', Icon: User },
]

const ON_LIST: { kicker: string; line: string; sub?: string; tools?: { name: string; logo: string; dark?: boolean }[]; blue?: boolean }[] = [
  {
    kicker: 'runs outbound on commission',
    line: 'about to close a company worth close to **$23 billion**',
    sub: 'gifting ipads to the cxos they visit. already closed a $100k one off deal',
  },
  {
    kicker: 'solo agency, doing $50k',
    line: 'finds customers with',
    tools: [
      { name: 'apify', logo: 'apify.svg' },
      { name: 'treg', logo: 'treg.svg', dark: true },
      { name: 'clay', logo: 'clay.png' },
    ],
    blue: true,
  },
  {
    kicker: 'lead gen agency',
    line: 'building a **$10M** lead gen business on cold email',
    sub: 'clients pay them to book the meetings. sharing all the sauce they use in house',
  },
]

function Bold({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/).map((part, i) =>
        i % 2 ? (
          <span key={i} className="font-black text-[#2A8CFF]">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function OnTheList() {
  return (
    <div className="w-full text-left">
      <p className="lk-hand mb-3 text-center text-2xl text-[#0D2A4C] sm:text-3xl">
        the type of people <span className="lk-bluekey text-3xl sm:text-4xl">already</span> on the waitlist
      </p>
      <div className="grid gap-3">
        {ON_LIST.map((c) =>
          c.blue ? (
            <div key={c.kicker} style={GRADIENT} className="rounded-md p-5 text-white shadow-[0_4px_0_var(--lk-brand-deep)]">
              <p className="lk-hand text-2xl leading-tight text-white">{c.kicker}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xl font-black">
                {c.line}
                {c.tools?.map((t) => (
                  <span
                    key={t.name}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border-2 border-white bg-white py-[3px] pl-[3px] pr-2.5 text-base font-black leading-none text-[#0D2A4C] shadow-[0_3px_0_var(--lk-brand-deep)]"
                  >
                    <img src={`/images/tools/${t.logo}`} alt="" className={`size-6 flex-none rounded-sm object-contain ${t.dark ? 'bg-[#111] p-0.5' : 'bg-white'}`} />
                    {t.name}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <div key={c.kicker} className="rounded-md border-2 border-[#d4e8ff] bg-white p-5 shadow-[0_4px_0_#c8d5e6]">
              <p className="lk-hand text-2xl leading-tight text-[#2A8CFF]">{c.kicker}</p>
              <p className="mt-1 text-xl font-black leading-snug">
                <Bold text={c.line} />
              </p>
              {c.sub ? <p className="lk-body mt-1 text-base leading-snug">{c.sub}</p> : null}
            </div>
          ),
        )}
      </div>
    </div>
  )
}

export function GoGettersCta() {
  return (
    <div id="go-getters" className="lk-repo w-full overflow-x-clip bg-white text-[18px] leading-relaxed text-[#0D2A4C] antialiased">
      <section className="relative overflow-hidden px-4 pb-16 pt-6 sm:pb-24 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, transparent 40%, #000 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, transparent 40%, #000 100%)',
          }}
        >
          <Dither
            waveColor={[0.16, 0.55, 1]}
            backgroundColor={[1, 1, 1]}
            colorNum={4}
            pixelSize={3}
            waveAmplitude={0.25}
            waveFrequency={3}
            waveSpeed={0.04}
            enableMouseInteraction={false}
          />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-t from-transparent to-white" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="text-title mx-auto max-w-3xl text-[#0D2A4C]">
            We use these tools to make money.
            <br className="hidden sm:block" />{' '}
            <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">That’s why they’re free.</span>
          </h2>
          <p className="lk-body mt-4 hidden max-w-2xl text-lg font-bold sm:block sm:text-xl">
            join our comm and it keeps the open source tools free. the plays we run with these tools go to members first.
          </p>
        </div>
        <div className="relative mx-auto mt-6 grid w-full max-w-[620px] grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-6 lg:max-w-none lg:grid-cols-[550px_minmax(0,460px)] lg:justify-center lg:gap-y-8">
          <div className="mx-auto w-full max-w-[550px] lg:col-start-1 lg:row-start-1">
            <VideoCarousel />
          </div>
          <div className="w-full lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <p className="mb-1 hidden items-center justify-center gap-2 text-[#2A8CFF] lg:flex">
              <span className="lk-bluekey text-3xl">start here, takes 2 minutes</span> <DownArrow />
            </p>
            <div
              id="apply"
              className="w-full scroll-mt-6 rounded-md border-2 border-[#2A8CFF] bg-white p-5 shadow-[0_4px_0_var(--lk-brand-deep),0_0_28px_rgba(42,140,255,.35)] sm:p-6"
            >
              <WhopJoin />
            </div>
          </div>
          <div className="mx-auto w-full max-w-[620px] lg:col-start-1 lg:row-start-2">
            <OnTheList />
          </div>
        </div>
        <div className="relative mt-16" style={{ '--lk-brand-deep': '#c8d5e6' } as CSSProperties}>
          <p className="lk-hand mx-auto mb-5 max-w-6xl text-left text-2xl leading-[2.4rem] text-[#0D2A4C]">
            ideas being <span className="lk-bluekey text-3xl">implemented</span> by{' '}
            {WHO.map(({ name, Icon }) => (
              <span
                key={name}
                className="mx-0.5 inline-flex items-center gap-1.5 rounded-sm bg-[#2A8CFF] px-1.5 py-0.5 align-middle text-lg font-black leading-none text-white shadow-[0_3px_0_var(--lk-brand-deep)]"
              >
                <Icon size={16} strokeWidth={2.75} />
                {name}
              </span>
            ))}
            <HandArrow />
          </p>
          <ReviewMarquee reviews={GG_REVIEWS} />
        </div>
      </section>
    </div>
  )
}
