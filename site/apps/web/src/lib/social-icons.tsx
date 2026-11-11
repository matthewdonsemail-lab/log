import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faRedditAlien, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { SquircleBorder, useComposedRef, useSquircleBorder, useSquircleClip } from '@listeningkit/ui'
import type { Platform } from './platform'

export type SocialIcon = {
  id: Platform
  label: string
  icon: IconDefinition
}

export const SOCIAL_ICONS: SocialIcon[] = [
  { id: 'facebook', label: 'Facebook', icon: faFacebook },
  { id: 'x', label: 'X', icon: faXTwitter },
  { id: 'reddit', label: 'Reddit', icon: faRedditAlien }
]

export function SocialGlyph({ icon, className }: { icon: SocialIcon; className?: string }) {
  return <FontAwesomeIcon icon={icon.icon} aria-label={icon.label} role="img" className={className} />
}

export type SocialBadgeVariant = 'white' | 'blue'

export function SocialBadge({
  icon,
  variant = 'white',
  className
}: {
  icon: SocialIcon
  variant?: SocialBadgeVariant
  className?: string
}) {
  const RADIUS = 12
  const isBlue = variant === 'blue'
  const clip = useSquircleClip<HTMLSpanElement>(RADIUS)
  const border = useSquircleBorder<HTMLSpanElement>(RADIUS + 1)
  const setRef = useComposedRef(clip.ref, border.ref)

  return (
    <span
      title={icon.label}
      ref={setRef}
      style={clip.style}
      // Fixed-size icon: never flex-shrink, or the box distorts (e.g. 28A-32
      // inside a 28px parent) and the squircle measures the wrong geometry.
      className={`relative flex size-8 shrink-0 items-center justify-center ${className ?? ''}`}
    >
      <SquircleBorder
        border={border.state}
        fill={isBlue ? '#2A8CFF' : '#FFFFFF'}
        stroke={isBlue ? '#FFFFFF' : '#2A8CFF'}
        strokeWidth={2}
        transitionStroke={false}
        className="z-10"
      />
      <SocialGlyph
        icon={icon}
        className={`relative z-10 size-4 ${isBlue ? 'text-white' : 'text-[#2A8CFF]'}`}
      />
    </span>
  )
}
