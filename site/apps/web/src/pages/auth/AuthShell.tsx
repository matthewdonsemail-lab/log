import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { UsecaseLoop } from '@/landing/UsecaseLoop'
import { ClayClouds } from '@/landing/ClayClouds'
import { DitherFade } from '@/landing/useCases/DitherFade'

export const authFieldClass = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none placeholder:text-slate-400 focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20'

export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white font-sans text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-white lg:hidden">
        <div className="absolute inset-x-0 top-0 h-[54rem] bg-[#2A8CFF]">
          <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} hold={0.18} className="absolute inset-x-0 bottom-0 h-[46rem]" />
          <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.85)_0%,transparent_80%)]" />
          <ClayClouds className="absolute inset-x-0 top-0 h-[18rem] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]" />
        </div>
      </div>
      <div className="relative grid min-h-screen w-full items-stretch lg:grid-cols-2">
        <section className="flex flex-col px-5 pb-6 pt-5 sm:px-10 lg:px-20 lg:py-10 xl:px-32">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/90 drop-shadow-[0_1px_3px_rgba(6,32,72,0.45)] hover:text-white lg:text-slate-500 lg:drop-shadow-none lg:hover:text-slate-900"><ArrowLeft size={16} /> Back to ListeningKit</Link>
          <div className={`mx-auto mt-[8.5rem] flex w-full max-w-sm flex-1 flex-col justify-center rounded-[1.75rem] border-2 border-[#C3D3E8] bg-[#F8FBFF] px-6 py-8 sm:px-8 lg:mt-0 ${wide ? 'lg:max-w-sm' : 'lg:max-w-xs'} lg:flex-none lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:py-16`}>
            <Link to="/" aria-label="ListeningKit home" className="mb-6 self-center"><img src="/logo.svg" alt="" className="size-14 rounded-[14px] object-contain" /></Link>
            {children}
          </div>
        </section>
        <aside aria-label="ListeningKit showcase" className="hidden overflow-hidden bg-white p-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-screen lg:flex-col lg:justify-center"><div className="flex min-h-0 flex-1 flex-col overflow-hidden"><UsecaseLoop /></div></aside>
      </div>
    </main>
  )
}
