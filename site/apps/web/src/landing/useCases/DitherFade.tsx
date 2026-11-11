import { useEffect, useRef, type CSSProperties } from 'react'

const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function DitherFade({ stops, cell = 4, className = '', style, hold = 0 }: { stops: string[]; cell?: number; className?: string; style?: CSSProperties; hold?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const key = stops.join('|')
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const colours = stops.map(hexToRgb)
    const draw = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      if (!width || !height) return
      const cols = Math.ceil(width / cell)
      const rows = Math.ceil(height / cell)
      canvas.width = cols
      canvas.height = rows
      const context = canvas.getContext('2d')
      if (!context) return
      const image = context.createImageData(cols, rows)
      const segments = colours.length - 1
      for (let y = 0; y < rows; y++) {
        const raw = rows === 1 ? 0 : y / (rows - 1)
        const t = hold > 0 ? Math.min(1, Math.max(0, (raw - hold) / (1 - hold))) : raw
        const position = t * segments
        const segment = Math.min(Math.floor(position), segments - 1)
        const local = position - segment
        for (let x = 0; x < cols; x++) {
          const threshold = (BAYER_4[(y % 4) * 4 + (x % 4)] + 0.5) / 16
          const [r, g, b] = local > threshold ? colours[segment + 1] : colours[segment]
          const index = (y * cols + x) * 4
          image.data[index] = r
          image.data[index + 1] = g
          image.data[index + 2] = b
          image.data[index + 3] = 255
        }
      }
      context.putImageData(image, 0, 0)
    }
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [key, cell, hold])
  return <canvas ref={canvasRef} aria-hidden="true" className={`block [image-rendering:pixelated] ${className}`} style={style} />
}
