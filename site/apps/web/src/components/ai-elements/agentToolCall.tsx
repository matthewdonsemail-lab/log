import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircleNotch, faPlug, faTerminal } from '@fortawesome/free-solid-svg-icons'

export type AgentToolCallData = { name: string; args: string; result: string[]; server?: string }

export function AgentToolCall({ call, done, running = true, variant = 'claude' }: { call: AgentToolCallData; done: boolean; running?: boolean; variant?: 'claude' | 'codex' | 'dark' }) {
  if (variant === 'codex') {
    return (
      <div className="text-sm">
        <div className="flex min-w-0 items-center gap-2 text-[#5d5d5d]">
          <FontAwesomeIcon icon={done ? faTerminal : faCircleNotch} spin={!done && running} className="shrink-0 text-[11px]" />
          <span>{done ? 'Called' : 'Calling'}</span>
          <span className="min-w-0 break-all rounded bg-[#f3f3f3] px-1.5 py-0.5 font-mono text-xs text-[#0d0d0d]">{call.server ?? 'log'}.{call.name}</span>
        </div>
        {done ? (
          <div className="mt-2 rounded-xl bg-[#f9f9f9] px-3 py-2 font-mono text-xs leading-5 text-[#5d5d5d]">
            <div className="truncate text-[#8f8f8f]">{call.args}</div>
            {call.result.map((line, index) => <div key={index} className="break-words">{line}</div>)}
          </div>
        ) : null}
      </div>
    )
  }

  const dark = variant === 'dark'
  return (
    <div className={`overflow-hidden rounded-lg border font-sans text-sm ${dark ? 'border-white/15 bg-white/[0.04] text-slate-200' : 'border-[#E5E0D6] bg-white/60'}`}>
      <div className="flex min-w-0 items-center gap-2 px-3 py-2">
        <FontAwesomeIcon icon={faPlug} className={`shrink-0 text-xs ${dark ? 'text-slate-400' : 'text-[#8a8780]'}`} />
        <span className="font-medium">{call.server ?? 'log'}</span>
        <span className={dark ? 'text-slate-500' : 'text-[#8a8780]'}>·</span>
        <span className="shrink-0 font-medium">{call.name}</span>
        <span className={`min-w-0 flex-1 truncate font-mono text-xs ${dark ? 'text-slate-400' : 'text-[#8a8780]'}`}>{call.args}</span>
        <FontAwesomeIcon icon={done ? faCheck : faCircleNotch} spin={!done && running} className={`shrink-0 text-xs ${done ? dark ? 'text-emerald-300' : 'text-[#5a8a3c]' : 'text-[#c96442]'}`} />
      </div>
      {done ? (
        <div className={`border-t px-3 py-2 font-mono text-xs leading-5 ${dark ? 'border-white/15 text-slate-400' : 'border-[#E5E0D6] text-[#5b5950]'}`}>
          {call.result.map((line, index) => <div key={index} className="break-words">{line}</div>)}
        </div>
      ) : null}
    </div>
  )
}
