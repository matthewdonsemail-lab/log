import type { ReactNode } from 'react'
import { useSquircleBorder, useSquircleClip, cn } from '@listeningkit/ui'

export type SquircleBadgeProps = {
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function SquircleBadge({ children, icon, className }: SquircleBadgeProps) {
  const clip = useSquircleClip<HTMLSpanElement>(10)
  const border = useSquircleBorder<HTMLSpanElement>(10)

  return (
    <span
      ref={border.ref}
      className={cn(
        'relative inline-flex w-fit items-center gap-1.5 py-1.5 pr-3 pl-2 text-sm font-medium tracking-[-0.2px] text-[#2B7FFF] md:gap-2 md:py-2 md:pr-3.5 md:pl-2.5 md:text-base',
        className
      )}
    >
      <span
        ref={clip.ref}
        style={clip.style}
        aria-hidden="true"
        className="absolute inset-0 bg-[#EFF6FF]"
      />
      {icon ? (
        <span className="relative inline-flex size-4 shrink-0 items-center justify-center text-[#2B7FFF] md:size-5 [&_svg]:size-full">
          {icon}
        </span>
      ) : null}
      <span className="relative">{children}</span>
      <svg
        width={border.state.width}
        height={border.state.height}
        viewBox={border.state.path ? `0 0 ${border.state.width} ${border.state.height}` : undefined}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        {border.state.path ? (
          <path
            d={border.state.path}
            fill="none"
            stroke="rgba(43,127,255,0.1)"
            strokeWidth={1}
          />
        ) : null}
      </svg>
    </span>
  )
}
