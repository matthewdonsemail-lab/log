import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

export const SLIDE_GAP_REM = 3

export function useDragCarousel(count: number) {
  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number; id: number; horizontal: boolean | null } | null>(null)
  const dragRef = useRef(0)
  const wheelLock = useRef(0)
  const go = (next: number) => setActive(Math.min(count - 1, Math.max(0, next)))

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as HTMLElement).closest('a, button, video, [data-no-drag]')) return
    dragStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId, horizontal: null }
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const start = dragStart.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (start.horizontal === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      start.horizontal = Math.abs(dx) > Math.abs(dy)
      if (start.horizontal) viewportRef.current?.setPointerCapture(event.pointerId)
    }
    if (!start.horizontal) return
    const atEdge = (active === 0 && dx > 0) || (active === count - 1 && dx < 0)
    dragRef.current = atEdge ? dx * 0.3 : dx
    setDrag(dragRef.current)
  }

  const onPointerEnd = () => {
    const start = dragStart.current
    dragStart.current = null
    if (!start?.horizontal) return
    const moved = dragRef.current
    const width = viewportRef.current?.offsetWidth ?? 1
    const threshold = Math.min(120, width * 0.15)
    if (moved <= -threshold) go(active + 1)
    else if (moved >= threshold) go(active - 1)
    dragRef.current = 0
    setDrag(0)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 25) return
      event.preventDefault()
      const now = Date.now()
      if (now < wheelLock.current) return
      wheelLock.current = now + 600
      setActive((current) => Math.min(count - 1, Math.max(0, current + (event.deltaX > 0 ? 1 : -1))))
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [count])

  const viewportProps = {
    ref: viewportRef,
    className: `w-full touch-pan-y select-none [&_img]:[-webkit-user-drag:none] ${drag ? 'cursor-grabbing' : 'cursor-grab'}`,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onDragStart: (event: { preventDefault: () => void }) => event.preventDefault(),
  }

  const trackProps = {
    className: `flex ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${drag ? '' : 'transition-transform duration-500'}`,
    style: {
      gap: `${SLIDE_GAP_REM}rem`,
      transform: `translateX(calc(${-active} * (100% + ${SLIDE_GAP_REM}rem) + ${drag}px))`,
    },
  }

  return { active, go, drag, viewportProps, trackProps }
}
