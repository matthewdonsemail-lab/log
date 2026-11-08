import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { RepoLink } from '../RepoLink'
import { PlayChat } from '../useCases/UseCasesPage'
import type { PlatformPage } from '../useCases/platformPages'

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
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_0_#C8D5E6,0_0_0_1px_#E1E8F0] sm:p-7">
      <p className="text-3xl sm:text-4xl">
        <span className={STICKER}>{title}</span>
      </p>
      <ul className="mt-3">
        {rows.map((row, i) => (
          <li key={i} className="flex items-baseline justify-between gap-4 border-b border-dashed border-[#C8D5E6] py-3 last:border-b-0">
            <span className="text-lg text-[#0D2A4C]" style={HAND}>
              {row.label}
              {row.note ? <span className="block text-[13px] text-[#0D2A4C]/50" style={{ fontFamily: 'inherit' }}>{row.note}</span> : null}
            </span>
            <span className="shrink-0 text-xl font-black tabular-nums text-[#0D2A4C] sm:text-2xl">{row.value}</span>
          </li>
        ))}
      </ul>
      {total ? (
        <div className="mt-3 flex items-baseline justify-between gap-4 rounded-xl bg-[#2A8CFF] px-4 py-3 text-white">
          <span className="text-lg" style={HAND}>{total.label}</span>
          <span className="shrink-0 text-2xl font-black tabular-nums">{total.value}</span>
        </div>
      ) : null}
    </div>
  )
}

export type CompareRow = { what: string; them: ReactNode; us: ReactNode }

export function CompareTable({ them, us, rows }: { them: string; us: string; rows: CompareRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_0_#C8D5E6,0_0_0_1px_#E1E8F0]">
      <div className="grid grid-cols-[1fr_1fr] border-b border-[#E1E8F0] text-[13px] font-black uppercase sm:grid-cols-[10rem_1fr_1fr]">
        <span className="hidden px-4 py-3 text-[#0D2A4C]/50 sm:block" />
        <span className="px-4 py-3 text-[#0D2A4C]/50">{them}</span>
        <span className="bg-[#F3F8FF] px-4 py-3 text-[#2A8CFF]">{us}</span>
      </div>
      {rows.map((row) => (
        <div key={row.what} className="grid grid-cols-[1fr_1fr] border-b border-dashed border-[#E1E8F0] last:border-b-0 sm:grid-cols-[10rem_1fr_1fr]">
          <span className="col-span-2 px-4 pt-3 text-sm font-black text-[#0D2A4C] sm:col-span-1 sm:py-3">{row.what}</span>
          <span className="px-4 py-3 text-[15px] leading-snug text-[#0D2A4C]/70">{row.them}</span>
          <span className="bg-[#F3F8FF] px-4 py-3 text-[15px] font-bold leading-snug text-[#0D2A4C]">{row.us}</span>
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
