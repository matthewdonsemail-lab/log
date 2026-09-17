import type { ReactNode } from 'react'

export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-white" style={{ backgroundColor: '#2a8cff', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
      {children}
    </div>
  )
}

export function BrandHeader() {
  return (
    <div className="flex items-center gap-3 text-left">
      <img src="/logo.svg" alt="ListeningKit logo" className="size-11 shrink-0 rounded-[10px] object-contain" />
      <div className="flex flex-col gap-0.5">
        <p className="text-[17px] font-bold leading-tight text-white">ListeningKit</p>
        <p className="text-[13px] leading-snug text-white/70">Live social listening</p>
      </div>
    </div>
  )
}
