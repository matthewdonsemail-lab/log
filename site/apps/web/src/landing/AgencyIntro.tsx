import { Dashed } from './Control'

const WHY: Record<string, { name: string; why: string }> = {
  x: { name: 'X', why: 'so every DM waiting on you gets answered in your own voice' },
  discord: { name: 'Discord', why: 'so you’re the one who answers first in every community you’re in' },
  slack: { name: 'Slack', why: 'so the client chats you’re already in turn into more work' },
  instagram: { name: 'Instagram', why: 'so everyone who asks about your offer gets an answer the moment they DM' },
  reddit: { name: 'Reddit', why: 'so you see what your niche is asking for before anyone else does' },
}

export function AgencyIntro({ platformId }: { platformId?: string }) {
  const line = platformId ? WHY[platformId] : undefined
  return (
    <section aria-label="What ListeningKit is" className="relative mx-auto w-full max-w-[86rem] pb-10 pt-2 md:pb-14">
      <div className="relative md:pr-40">
        <p className="text-3xl font-black leading-[1.3] tracking-[-0.03em] text-[#0D2A4C] md:text-[min(2.85vw,2.75rem)] md:leading-[1.35]">
          ListeningKit{' '}
          <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">bends {line ? line.name : 'social media'}</span> for{' '}
          <Dashed>service businesses, startups and solopreneurs</Dashed>
          {line ? `, ${line.why}` : ''}.
        </p>
        <svg
          aria-hidden="true"
          viewBox="0 0 120 170"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-[4%] top-[70%] hidden h-40 w-auto text-[#2A8CFF] md:block"
        >
          <path d="M10 8 C 78 6, 112 40, 98 92 C 88 128, 66 146, 46 160" />
          <path d="M44 138 L 45 161 L 68 155" />
        </svg>
      </div>
    </section>
  )
}
