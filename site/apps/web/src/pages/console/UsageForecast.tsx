import { useMemo, useState } from 'react'
import { AreaChart } from '../../components/dither-kit/area-chart'
import { Area } from '../../components/dither-kit/area'
import { Grid } from '../../components/dither-kit/grid'
import { YAxis } from '../../components/dither-kit/y-axis'
import { useChartPart } from '../../components/dither-kit/chart-context'
import type { UsageSummary } from './usageData'

const config = { usage: { label: 'Calls', color: 'brand' } } as const
const margins = { top: 26, left: 62, bottom: 38, right: 18 }
const dayMs = 86400000
const count = (value: number) => Math.round(value).toLocaleString()
type UsagePoint = { label: string; start: string; usage: number; daily: number; failed: number | null; forecast: boolean }

function UsageTooltip({ data }: { data: UsagePoint[] }) {
  const chart = useChartPart('UsageTooltip')
  const point = chart.hoverIndex === null ? null : data[chart.hoverIndex]
  if (!chart.ready || !point) return null
  const date = new Date(point.start).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
  return <div className="pointer-events-none absolute top-2 z-30 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg" style={{ left: Math.max(4, Math.min(chart.plot.width + margins.left + margins.right - 228, chart.xCenter(chart.hoverIndex ?? 0) + margins.left + 14)) }}>
    <p className="mb-3 text-sm font-semibold text-slate-600">{date}</p>
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span className="h-4 w-1 rounded-full bg-[#2A8CFF]" /><span>{point.forecast ? 'Forecast' : 'Calls so far'}</span><span className="ml-auto tabular-nums">{count(point.usage)}</span></div>
    <dl className="ml-3 mt-2 space-y-1.5 text-sm text-slate-600"><div className="flex justify-between gap-3"><dt>{point.forecast ? 'Projected that day' : 'That day'}</dt><dd className="tabular-nums">{count(point.daily)}</dd></div>{point.failed !== null ? <div className="flex justify-between"><dt>Failed that day</dt><dd className="tabular-nums">{count(point.failed)}</dd></div> : null}</dl>
  </div>
}
UsageTooltip.chartLayer = 'dom' as const

function UsageDateAxis({ data, actualEnd }: { data: UsagePoint[]; actualEnd: number }) {
  const chart = useChartPart('UsageDateAxis')
  if (!chart.ready) return null
  const hover = chart.hoverIndex
  const edge = Math.min(32, chart.plot.width / 2)
  const positionOf = (index: number) => Math.max(edge, Math.min(chart.plot.width - edge, chart.xCenter(index)))
  const hoverPosition = hover === null ? null : positionOf(hover)
  const indices = [...new Set([0, Math.round(actualEnd / 2), actualEnd, data.length - 1])]
  const displayed: number[] = []
  return <div className="activity-chart-axis pointer-events-none absolute bottom-0 h-7 rounded-md border border-slate-200 bg-slate-100 text-sm leading-[26px] text-slate-600" style={{ left: margins.left, right: margins.right }}>
    {indices.map((index) => {
      const position = positionOf(index)
      const hidden = displayed.some((previous) => Math.abs(previous - position) < 66) || (hoverPosition !== null && Math.abs(position - hoverPosition) < 66)
      if (!hidden) displayed.push(position)
      return <span key={index} className={`absolute whitespace-nowrap ${index === actualEnd ? 'font-semibold text-[#2A8CFF]' : ''}`} style={{ left: position, transform: 'translateX(-50%)', visibility: hidden ? 'hidden' : 'visible' }}>{data[index].label.toUpperCase()}</span>
    })}
    {hoverPosition !== null && hover !== null && data[hover] ? <span className="activity-hover-date absolute left-0 whitespace-nowrap rounded bg-blue-50 px-1 font-semibold text-[#0D2A4C]" style={{ transform: `translateX(${hoverPosition}px) translateX(-50%)` }}>{data[hover].label.toUpperCase()}</span> : null}
  </div>
}
UsageDateAxis.chartLayer = 'dom' as const

function ForecastMarkers({ data, actualEnd, activeIndex }: { data: UsagePoint[]; actualEnd: number; activeIndex: number | null }) {
  const chart = useChartPart('ForecastMarkers')
  if (!chart.ready) return null
  const active = activeIndex === null ? null : data[activeIndex]
  const last = data.length - 1
  return <g className="text-[#2A8CFF]">
    <path d={data.slice(0, actualEnd + 1).map((point, index) => `${index ? 'L' : 'M'}${chart.xCenter(index)},${chart.y(point.usage)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    <line x1={chart.xCenter(actualEnd)} x2={chart.xCenter(actualEnd)} y1={0} y2={chart.plot.height} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3 5" />
    {[actualEnd, last].map((index) => <circle key={index} cx={chart.xCenter(index)} cy={chart.y(data[index].usage)} r={3} fill="white" stroke="currentColor" strokeWidth={1.5} />)}
    <text x={chart.xCenter(last)} y={chart.y(data[last].usage) - 10} textAnchor="end" fill="currentColor" className="text-sm font-semibold">{count(data[last].usage)}</text>
    {active && activeIndex !== null ? <g><line x1={chart.xCenter(activeIndex)} x2={chart.xCenter(activeIndex)} y1={0} y2={chart.plot.height} stroke="#94a3b8" strokeWidth={1} strokeOpacity={0.6} /><circle cx={chart.xCenter(activeIndex)} cy={chart.y(active.usage)} r={5} fill="white" stroke="currentColor" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 4px #2A8CFF66)' }} /></g> : null}
  </g>
}

export function UsageForecast({ summary }: { summary: UsageSummary }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { data, actualEnd, average } = useMemo(() => {
    let cumulative = 0
    const points: UsagePoint[] = summary.buckets.map((bucket) => {
      cumulative += bucket.calls
      return { label: new Date(bucket.start).toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }), start: bucket.start, usage: cumulative, daily: bucket.calls, failed: bucket.failed, forecast: false }
    })
    const actualEnd = points.length - 1
    const completed = summary.buckets.slice(0, -1).slice(-7)
    const average = completed.length ? completed.reduce((sum, bucket) => sum + bucket.calls, 0) / completed.length : 0
    const lastStart = Date.parse(points[actualEnd]?.start ?? summary.to)
    for (let index = 1; index <= 7; index++) {
      const date = new Date(lastStart + dayMs * index)
      points.push({ label: date.toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }), start: date.toISOString(), usage: Math.round(cumulative + average * index), daily: Math.round(average), failed: null, forecast: true })
    }
    return { data: points, actualEnd, average }
  }, [summary])
  const futureFraction = 1 - actualEnd / (data.length - 1)
  return <div className="min-w-0 rounded-xl bg-white p-5 sm:p-6">
    <div className="text-2xl font-bold tracking-tight text-[#0D2A4C]">{count(summary.totals.calls)} calls</div>
    <p className="mt-1 text-sm leading-6 text-slate-600">Last 30 days · <span className="font-semibold text-[#2A8CFF]">{count(summary.totals.failed)} failed</span></p>
    {summary.totals.calls && actualEnd >= 0 ? <div className="relative mt-3 h-64 min-w-0" role="img" aria-label={`${count(summary.totals.calls)} recorded calls, with a seven day forecast based on the previous seven completed days.`}>
      <AreaChart data={data} config={config} margins={margins} bloom="off" onHoverChange={setActiveIndex}>
        <Grid /><YAxis className="fill-current text-sm text-slate-600" tickFormatter={(value) => new Intl.NumberFormat('en', { notation: 'compact' }).format(value)} /><UsageTooltip data={data} /><UsageDateAxis data={data} actualEnd={actualEnd} />
        <Area dataKey="usage" variant="hatched" strokeVariant="dashed" /><ForecastMarkers data={data} actualEnd={actualEnd} activeIndex={activeIndex} />
      </AreaChart>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 calc(${futureFraction * 100}% - ${futureFraction * (margins.left + margins.right) - margins.right}px) 0 0)` }}>
        <AreaChart data={data} config={config} margins={margins} bloom="off" interactive={false}><Area dataKey="usage" variant="gradient" /><ForecastMarkers data={data} actualEnd={actualEnd} activeIndex={activeIndex} /></AreaChart>
      </div>
    </div> : <div className="flex h-64 items-center justify-center text-sm text-slate-600">No calls recorded in the last 30 days.</div>}
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"><span>Averaging <strong className="text-[#0D2A4C]">{count(average)} calls</strong> a day over the last 7 completed days</span><div className="flex gap-3"><span><span className="mr-1 text-[#2A8CFF]">━</span>Calls</span><span><span className="mr-1 text-[#2A8CFF]">┄</span>7-day forecast</span></div></div>
  </div>
}
