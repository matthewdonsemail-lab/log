import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare, faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import type { HarnessSetup, SetupStep } from './harnessPages'

const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => {})
  }
  return (
    <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[#0D2A4C] p-4 shadow-[0_4px_0_#061a33]">
      <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono text-[13px] leading-6 text-white">{code}</pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[12px] font-bold text-white transition-colors hover:bg-white/25"
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[11px]" />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function StepItem({ step, index }: { step: SetupStep; index: number }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#2A8CFF] font-mono text-[14px] font-bold text-white shadow-[0_3px_0_#1A5FC8]">{index + 1}</span>
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="text-[16px] leading-snug text-[#0D2A4C]">{step.text}</p>
        {step.code ? <CodeBlock code={step.code} /> : null}
      </div>
    </li>
  )
}

export function HarnessSetupSection({ setup }: { setup: HarnessSetup }) {
  const [active, setActive] = useState(0)
  const route = setup.routes[active] ?? setup.routes[0]
  return (
    <section id="setup" aria-label={`Connect log to ${setup.name}`} className="w-full scroll-mt-24 bg-white px-4 pb-8 pt-20 md:px-6 md:pt-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="text-title text-[#0D2A4C]">
          Connect log to <span className={STICKER}>{setup.name}</span> once
        </h2>
        <p className="text-lede max-w-2xl font-semibold text-[#0D2A4C]/80">Every step below comes from {setup.name}’s own docs and log’s. After this, you just ask.</p>
        {setup.routes.length > 1 ? (
          <div role="tablist" aria-label={`Ways to connect ${setup.name}`} className="flex flex-wrap justify-center gap-1.5 rounded-2xl bg-[#F3F6FA] p-1.5">
            {setup.routes.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                className={`rounded-xl px-3.5 py-2 text-[14px] font-bold transition-colors ${index === active ? 'bg-white text-[#2A8CFF] shadow-[0_2px_0_#E1E8F0]' : 'text-[#0D2A4C]/70 hover:text-[#0D2A4C]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-[#E1E8F0] bg-white p-6 text-left shadow-[0_4px_0_#E1E8F0] md:p-8">
        <p className="flex items-center gap-2.5 text-[18px] font-black text-[#0D2A4C]">
          <img src={setup.logo} alt="" className="size-6 object-contain" />
          {route.label}
        </p>
        <p className="mt-1 text-[15px] text-[#0D2A4C]/65">{route.best}</p>
        <ol className="mt-6 flex list-none flex-col gap-5 p-0">
          {route.steps.map((step, index) => (
            <StepItem key={`${route.id}${index}`} step={step} index={index} />
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[#E1E8F0] pt-5 text-[13px] text-[#0D2A4C]/60">
          <span className="font-bold">From the docs:</span>
          {route.sources.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#2A8CFF] hover:underline">
              {source.label}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
