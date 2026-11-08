import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { RepoLink } from '../RepoLink'
import { PlayChat } from '../useCases/UseCasesPage'
import type { PlatformPage } from '../useCases/platformPages'
import './story.css'

const HAND = { fontFamily: "'Schoolbell', cursive" }
export const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'

export function StoryKicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-2xl leading-snug text-[#0D2A4C] sm:text-3xl" style={HAND}>
      {children}
    </p>
  )
}

export function StorySection({ id, title, punch, children }: { id: string; title: ReactNode; punch: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-12">
      <h2 className="text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-black leading-[1] tracking-[-0.035em] text-[#0D2A4C]">{title}</h2>
      <p className="mt-3 text-xl text-[#0D2A4C]/55 sm:text-2xl" style={HAND}>
        {punch}
      </p>
      <div className="mt-6 flex flex-col gap-5 text-[18px] leading-relaxed text-[#0D2A4C]/85 sm:text-[19px]">{children}</div>
    </section>
  )
}

export type ReceiptRow = { label: ReactNode; value: string; note?: string }

export function Receipt({ title, rows, total }: { title: string; rows: ReceiptRow[]; total?: ReceiptRow }) {
  return (
    <div className="lk-story receipt">
      <p className="mb-1 text-3xl sm:text-4xl">
        <span className={STICKER}>{title}</span>
      </p>
      {rows.map((row, i) => (
        <div key={i} className="rLine">
          <p>
            {row.label}
            {row.note ? <small>{row.note}</small> : null}
          </p>
          <b className="bluekey">{row.value}</b>
        </div>
      ))}
      {total ? (
        <div className="rLine total">
          <p>{total.label}</p>
          <b className="bluekey">{total.value}</b>
        </div>
      ) : null}
    </div>
  )
}

export type CompareRow = { what: string; them: ReactNode; us: ReactNode }

export function CompareTable({ them, us, rows }: { them: string; us: string; rows: CompareRow[] }) {
  return (
    <div className="lk-story cmp">
      <div className="cmpRow cmpHead">
        <span className="k" />
        <span className="them">{them}</span>
        <span className="us bluekey">{us}</span>
      </div>
      {rows.map((row) => (
        <div key={row.what} className="cmpRow">
          <span className="k">{row.what}</span>
          <span className="a">{row.them}</span>
          <span className="b">{row.us}</span>
        </div>
      ))}
    </div>
  )
}

export function StoryCta({ page, title, href }: { page: PlatformPage; title: ReactNode; href: string }) {
  return (
    <aside className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      <div className="grid items-center gap-5 rounded-2xl bg-white p-5 shadow-[0_4px_0_#1A5FC8,0_12px_24px_-12px_rgba(13,42,76,0.35)] ring-1 ring-[#0D2A4C]/8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-6">
        <div className="flex flex-col items-start gap-4">
          <p className="text-[24px] font-black leading-tight tracking-[-0.02em] text-[#0D2A4C]">{title}</p>
          <RepoLink
            href={href}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2A8CFF] px-5 py-3 text-[16px] font-bold text-white shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
          >
            Set up log, it&apos;s free
            <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
          </RepoLink>
        </div>
        <PlayChat page={page} offset={0} />
      </div>
    </aside>
  )
}

export function StoryImage({ src, alt, caption }: { src: string; alt: string; caption: ReactNode }) {
  return (
    <figure className="flex flex-col gap-2">
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-xl border-2 border-[#D6E8FF]" />
      <figcaption className="text-lg text-[#0D2A4C]/60" style={HAND}>
        {caption}
      </figcaption>
    </figure>
  )
}

export type FaqItem = { q: string; a: string }

export function StoryFaq({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-12">
      <h2 className="text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-black leading-[1] tracking-[-0.035em] text-[#0D2A4C]">{title}</h2>
      <div className="mt-6 flex flex-col">
        {items.map((item) => (
          <div key={item.q} className="border-t-2 border-dashed border-[#D6E8FF] py-5 first:border-t-0">
            <h3 className="text-[22px] font-black leading-tight tracking-[-0.02em] text-[#0D2A4C]">{item.q}</h3>
            <p className="mt-2 text-[18px] leading-relaxed text-[#0D2A4C]/85">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
