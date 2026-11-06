import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { BrandMark, type BrandMarkId } from '../BrandMark'

export type AskAiProvider = { id: BrandMarkId; label: string; href: string }

function AskAiCard({ provider }: { provider: AskAiProvider }) {
  return (
    <a
      href={provider.href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-24 items-center justify-between gap-4 rounded-2xl bg-[#F8F9FA] px-5 py-4 text-[#0D2A4C] transition-colors hover:bg-[#EEF1F4]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <BrandMark id={provider.id} className="size-6 text-[#0D2A4C]" />
        <span className="text-lg font-medium tracking-[-0.4px]">Ask {provider.label}</span>
      </span>
      <FontAwesomeIcon icon={faAnglesRight} className="shrink-0 text-[14px] text-[#0D2A4C]/35 transition-colors group-hover:text-[#0D2A4C]" />
    </a>
  )
}

export function AskAi({ title, description, providers }: { title: ReactNode; description: ReactNode; providers: AskAiProvider[] }) {
  return (
    <section aria-label="Ask AI" className="w-full bg-white px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto w-full max-w-screen-2xl">
        <div
          className="relative rounded-[32px] bg-[#2A8CFF] px-6 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24"
          style={{ backgroundImage: "url('/askAiBg.webp')", backgroundSize: 'cover', backgroundPosition: 'center center' }}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] text-white md:text-5xl lg:text-6xl">{title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg md:leading-8">{description}</p>
          </div>
          <div className="mx-auto mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
            {providers.map((provider) => (
              <AskAiCard key={provider.label} provider={provider} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
