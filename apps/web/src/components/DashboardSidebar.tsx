import { useState, type ComponentType, type MouseEvent, type SVGProps } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { motion } from 'motion/react'
import {
  Bars3Icon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  KeyIcon,
  Squares2X2Icon,
  TagIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { cn, useSquircleClip } from '@listeningkit/ui'
import { DashboardSidebarUser } from './DashboardSidebarUser'

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type DashboardNavItem = { label: string; Icon: NavIcon; to?: string }

export const NAV: DashboardNavItem[] = [
  { label: 'Feed', Icon: Squares2X2Icon, to: '/dashboard' },
  { label: 'Groups', Icon: UsersIcon, to: '/dashboard/groups' },
  { label: 'Listings', Icon: TagIcon, to: '/dashboard/facebook/listings' },
  { label: 'Keywords', Icon: KeyIcon, to: '/dashboard/keywords' },
  { label: 'Analytics', Icon: ChartBarIcon, to: '/dashboard/analytics' },
  { label: 'Accounts', Icon: UserCircleIcon, to: '/dashboard/accounts' },
  { label: 'Brand', Icon: BuildingStorefrontIcon, to: '/dashboard/brand' },
  { label: 'Messages', Icon: ChatBubbleLeftRightIcon, to: '/dashboard/messages' },
  { label: 'Docs', Icon: BookOpenIcon, to: '/dashboard/docs' },
  { label: 'API', Icon: CommandLineIcon, to: '/dashboard/api' },
  { label: 'Settings', Icon: Cog6ToothIcon, to: '/dashboard/settings' },
]

// Sliding indicator travel per nav row: h-12 (48px) item + 4px flex gap.
const ITEM_PITCH = 52

// Shared active matcher for the desktop rail and the mobile bar.
// Nested routes (e.g. /dashboard/analytics/:keywordId) keep their section
// highlighted — except the index, which would otherwise match every
// dashboard path as a prefix.
export function isNavActive(item: DashboardNavItem, pathname: string) {
  return item.to
    ? pathname === item.to || (item.to !== '/dashboard' && pathname.startsWith(`${item.to}/`))
    : false
}

function NavItem({
  label,
  active,
  collapsed,
  Icon,
  to,
  onToggleCollapsed,
}: {
  label: string
  active: boolean
  collapsed: boolean
  Icon: NavIcon
  to?: string
  onToggleCollapsed: (collapsed: boolean) => void
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (active) {
      event.preventDefault()
      onToggleCollapsed(!collapsed)
    } else if (collapsed) {
      onToggleCollapsed(false)
    }
  }

  const className = cn(
    'relative flex h-12 w-full items-center overflow-hidden rounded-2xl py-2 pl-3 pr-3 text-sm font-semibold transition-[background-color,color,gap] duration-300',
    collapsed ? 'gap-0' : 'gap-3',
    active ? 'bg-brand-600/10 text-brand-600' : 'text-text-secondary hover:bg-black/[0.04]'
  )

  const inner = (
    <>
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#2A8CFF]' : 'bg-black/5'}`}
      >
        <Icon aria-hidden="true" className={`size-4 ${active ? 'text-white' : 'text-text-secondary'}`} />
      </span>
      {/* Label collapses to zero width/opacity instead of truncating into a sliver. */}
      <span
        className={cn(
          'min-w-0 truncate transition-[width,opacity,margin] duration-300',
          collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        )}
        aria-hidden={collapsed || undefined}
      >
        {label}
      </span>
    </>
  )

  return to ? (
    <Link to={to} title={collapsed ? label : undefined} onClick={handleClick} className={className} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <span title={collapsed ? label : undefined} className={className}>
      {inner}
    </span>
  )
}

export function DashboardSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onToggleCollapsed: (collapsed: boolean) => void
}) {
  const sideClip = useSquircleClip<HTMLElement>(20, 1, { topRight: 20, bottomRight: 20 })
  const indicatorClip = useSquircleClip<HTMLSpanElement>(7, 1, { topLeft: 0, bottomLeft: 0 })
  const { pathname } = useLocation()
  const activeIndex = NAV.findIndex((item) => item.to === pathname)

  return (
    <aside
      ref={sideClip.ref}
      style={sideClip.style}
      className={cn(
        'm-4 ml-0 hidden shrink-0 flex-col gap-6 bg-white transition-[width,padding] duration-300 ease-in-out sm:flex',
        collapsed ? 'w-20 px-3 py-6' : 'w-64 p-6'
      )}
    >
      <Link
        to="/"
        aria-label="ListeningKit home"
        title="ListeningKit"
        className={cn(
          'flex items-center justify-start overflow-hidden text-left transition-[gap] duration-300',
          collapsed ? 'gap-0' : 'gap-3'
        )}
      >
        <img src="/logo.svg" alt="ListeningKit logo" className="size-11 shrink-0 rounded-[12px] object-contain" />
        <span
          className={cn(
            'flex min-w-0 flex-col gap-0.5 whitespace-nowrap transition-[width,opacity] duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
          aria-hidden={collapsed || undefined}
        >
          <span className="truncate text-[17px] font-bold leading-tight text-text-primary">ListeningKit</span>
          <span className="truncate text-[13px] leading-snug text-text-secondary">Live social listening</span>
        </span>
      </Link>
      <nav className="flex min-h-0 flex-1 items-stretch">
        {/* Left indicator column — flush to the nav edge, no left padding. Collapses away
            in icon-only mode since the active pill background already shows state. */}
        <span
          className={cn(
            'relative shrink-0 overflow-hidden transition-[width,opacity] duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-1.5 opacity-100'
          )}
          aria-hidden="true"
        >
          <span
            className="pointer-events-none absolute left-0 top-0 flex h-12 w-full items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${activeIndex * ITEM_PITCH}px)` }}
          >
            <span ref={indicatorClip.ref} style={indicatorClip.style} className="block h-full w-1.5 bg-[#2A8CFF]" />
          </span>
          {NAV.map((item) => (
            <span key={item.label} className="block h-12 w-1.5" />
          ))}
        </span>
        <span className={cn('flex min-w-0 flex-1 flex-col gap-1 transition-[padding] duration-300', collapsed ? 'pl-0' : 'pl-2')}>
          {NAV.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              active={isNavActive(item, pathname)}
              collapsed={collapsed}
              Icon={item.Icon}
              to={item.to}
              onToggleCollapsed={onToggleCollapsed}
            />
          ))}
        </span>
      </nav>
      <DashboardSidebarUser collapsed={collapsed} />
    </aside>
  )
}

// Quick-switch destinations pinned to the mobile bottom bar; everything
// else lives in the hamburger popup. All NAV entries have a `to`, so the
// predicate below only narrows the type.
const MOBILE_BOTTOM_PATHS = ['/dashboard', '/dashboard/groups', '/dashboard/keywords', '/dashboard/messages']

function isBottomItem(item: DashboardNavItem): item is DashboardNavItem & { to: string } {
  return !!item.to && MOBILE_BOTTOM_PATHS.includes(item.to)
}

/**
 * Mobile navigation, rendered as a child of the header (composition only —
 * it is `fixed`, so it lays out against the viewport). Bottom-fixed bar
 * with the quick-switch sections plus a hamburger slot that opens the rest
 * of NAV in an upward popup, following the inferencesaver `DashboardMobileNav`
 * structure restyled to the light squircle language. Self-gates to <sm;
 * DashboardLayout unmounts it while a form is open so the full-screen form
 * is never covered.
 */
export function DashboardMobileNav() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: menuOpen,
    onOpenChange: setMenuOpen,
    placement: 'top-start',
    middleware: [offset(10), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'menu' })
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

  const bottomItems = NAV.filter(isBottomItem)
  const menuItems = NAV.filter((item) => !isBottomItem(item))

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-[100] flex items-stretch gap-1 border-t border-black/10 bg-white/95 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur sm:hidden"
    >
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-label="Open dashboard menu"
        aria-expanded={menuOpen}
        className={cn(
          'flex min-w-0 basis-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition-colors',
          menuOpen ? 'text-[#2A8CFF]' : 'text-text-secondary'
        )}
      >
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-xl',
            menuOpen ? 'bg-[#2A8CFF] text-white' : 'bg-black/5 text-text-secondary'
          )}
        >
          <Bars3Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="truncate">Menu</span>
      </button>
      {bottomItems.map((item) => {
        const active = isNavActive(item, pathname)
        return (
          <Link
            key={item.label}
            to={item.to}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-w-0 basis-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition-colors',
              active ? 'text-[#2A8CFF]' : 'text-text-secondary'
            )}
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-xl',
                active ? 'bg-[#2A8CFF] text-white' : 'bg-black/5 text-text-secondary'
              )}
            >
              <item.Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
      {menuOpen ? (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} className="z-[160]" {...getFloatingProps()}>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="w-[248px] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_20px_50px_rgba(10,24,48,0.28)]"
            >
              <DashboardSidebarUser />
              <div className="my-2 h-px bg-black/10" aria-hidden="true" />
              {menuItems.map((item) => {
                const active = isNavActive(item, pathname)
                return (
                  <Link
                    key={item.label}
                    to={item.to ?? '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      active ? 'bg-brand-600/10 text-brand-600' : 'text-text-secondary'
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-xl',
                        active ? 'bg-[#2A8CFF] text-white' : 'bg-black/5 text-text-secondary'
                      )}
                    >
                      <item.Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
              <div className="my-2 h-px bg-black/10" aria-hidden="true" />
              <Link
                to="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#2A8CFF] transition-colors hover:bg-black/[0.04]"
              >
                Connect your Socials
              </Link>
            </motion.div>
          </div>
        </FloatingPortal>
      ) : null}
    </nav>
  )
}
