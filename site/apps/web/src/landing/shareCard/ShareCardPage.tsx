import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faInstagram, faReddit, faSlack, faXTwitter, type IconDefinition } from '@fortawesome/free-brands-svg-icons'
import { ClayClouds } from '../ClayClouds'
import { DitherFade } from '../useCases/DitherFade'
import sharePages from '../useCases/sharePages.json'
import { faChatgptMark, faClaudeMark, faCursorMark, faGrokMark, faHermesMark } from '../agentMarks'
import '../story/story.css'

const ICONS: Record<string, IconDefinition> = { faXTwitter, faDiscord, faSlack, faInstagram, faReddit, faCursorMark, faClaudeMark, faChatgptMark, faHermesMark, faGrokMark }

type SharePage = (typeof sharePages)[number] & { headline?: string[]; agent?: { name: string; logo: string } }

const maskOf = (logo: string) => ({
  maskImage: `url(${logo})`,
  WebkitMaskImage: `url(${logo})`,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
})

const OUTLINE = Array.from({ length: 32 }, (_, index) => {
  const angle = (index / 32) * Math.PI * 2
  return `${(Math.cos(angle) * 6).toFixed(2)}px ${(Math.sin(angle) * 6).toFixed(2)}px 0 #0D2A4C`
})
  .concat('0 10px 0 #0D2A4C')
  .join(',')

export function ShareCardPage() {
  const { slug } = useParams()
  const page = (sharePages as SharePage[]).find((item) => item.slug === slug)
  if (!page) return null
  const [top, verb] = page.headline ?? ['let claude', 'control']
  const agent = page.agent ?? { name: 'Claude Code', logo: '/logos/tools/claude-desktop.svg' }
  return (
    <div className="lk-story relative isolate h-[630px] w-[1200px] overflow-hidden bg-[#2A8CFF] text-[#0D2A4C]">
      <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.8)_0%,transparent_80%)]" />
      <ClayClouds className="absolute inset-x-0 top-0 h-[560px] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" />
      <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} className="absolute inset-x-0 bottom-0 h-[230px] w-full" />
      <h1 className="absolute left-[60px] top-[40px] z-10 flex origin-left -rotate-2 flex-col gap-1 font-['Schoolbell',cursive] text-[88px] leading-[0.95] text-white [-webkit-text-stroke:2px_#fff]" style={{ textShadow: OUTLINE }}>
        <span>{top}</span>
        <span className="flex items-center gap-5">
          {verb}
          <span className="grid size-[86px] rotate-[4deg] place-items-center rounded-[22px] bg-white text-[#1E88FF] shadow-[0_0_0_6px_#0D2A4C,0_10px_0_6px_#0D2A4C] [text-shadow:none]">
            <FontAwesomeIcon icon={ICONS[page.icon]} className="text-[50px]" />
          </span>
          {page.card.name}
        </span>
      </h1>
      <img src="/logo.svg" alt="log" className="absolute right-[64px] top-[52px] z-10 size-[112px] rotate-[4deg] rounded-[26px] shadow-[0_0_0_6px_#fff,0_0_0_12px_#0D2A4C,0_16px_0_12px_#0D2A4C]" />
      <div className="absolute left-[90px] top-[262px] z-10 h-[420px] w-[1020px] overflow-hidden rounded-[30px] bg-[#F7F9FC] shadow-[0_0_0_5px_#0D2A4C,0_14px_0_5px_#0D2A4C]">
        <div className="flex items-center gap-3 border-b-2 border-[#0D2A4C]/10 bg-white px-7 py-3.5 text-[26px] font-black">
          <span aria-hidden className="block size-[34px] bg-[#c96442]" style={maskOf(agent.logo)} />
          {agent.name}
          <span className="ml-auto flex gap-2.5">
            {[0, 1, 2].map((dot) => (
              <i key={dot} className="size-[15px] rounded-full bg-[#0D2A4C]/15" />
            ))}
          </span>
        </div>
        <div className="flex flex-col gap-4 px-7 py-5">
          <p className="ml-auto rounded-[24px] bg-[#2A8CFF] px-6 py-3.5 text-[34px] font-bold leading-tight text-white">{page.chat.ask}</p>
          <p className="self-start rounded-[24px] bg-white px-6 py-3.5 text-[34px] font-bold leading-tight shadow-[0_0_0_2px_rgba(13,42,76,0.1)]">{page.chat.done}</p>
          <div className="flex gap-4">
            {page.chat.rows.map((row) => (
              <p key={row.who} className="flex items-center gap-3 rounded-[20px] bg-white px-5 py-2.5 text-[28px] font-bold shadow-[0_0_0_2px_rgba(13,42,76,0.1)]">
                {row.who}
                <em className="rounded-xl bg-[#E8F7EE] px-3 py-0.5 text-[22px] font-black not-italic text-[#1E8E4F]">{row.status}</em>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
