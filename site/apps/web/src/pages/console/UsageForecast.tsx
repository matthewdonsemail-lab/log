import { AreaChart } from '../../components/dither-kit/area-chart'
import { Area } from '../../components/dither-kit/area'
import { Grid } from '../../components/dither-kit/grid'
import { YAxis } from '../../components/dither-kit/y-axis'
import { ReferenceLine } from '../../components/dither-kit/reference-line'
import { useState } from 'react'
import { useChartPart } from '../../components/dither-kit/chart-context'

const config = { usage: { label: 'Usage (%)', color: 'brand' } } as const
const values = [0, 3, 16, 25, 39, 46, 46, 46, 46, 46, 46, 51, 51, 57, 86]
const data = Array.from({ length: 32 }, (_, index) => ({ label: new Date(Date.UTC(2026, 9, 28 + index)).toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }), usage: index < values.length ? values[index] : 86 + (index - 14) * 107 / 17 }))
const margins = { top: 26, left: 54, bottom: 38, right: 18 }

function UsageTooltip() {
  const chart = useChartPart('UsageTooltip')
  const index = chart.hoverIndex
  if (!chart.ready || index === null) return null
  const point = data[index]
  const change = point.usage - (data[index - 1]?.usage ?? 0)
  const date = new Date(Date.UTC(2026, 9, 28 + index)).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
  return <div className="pointer-events-none absolute top-2 z-30 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-lg" style={{ left: Math.max(4, Math.min(chart.plot.width + margins.left + margins.right - 212, chart.xCenter(index) + margins.left + 14)) }}>
    <p className="mb-3 text-sm font-semibold text-slate-600">{date}</p>
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span className="h-4 w-1 rounded-full bg-[#2A8CFF]" /><span>{index > 14 ? 'Forecast' : 'Used'}</span><span className="ml-auto tabular-nums">{point.usage.toFixed(1)}%</span></div>
    <div className="ml-3 mt-2 space-y-1.5 text-sm text-slate-600"><div className="flex justify-between"><span>That day</span><span className="tabular-nums">+{change.toFixed(1)}%</span></div><div className="flex justify-between"><span>Requests</span><span className="tabular-nums">{Math.round(change * 65).toLocaleString()}</span></div></div>
  </div>
}

UsageTooltip.chartLayer = 'dom' as const

function UsageDateAxis() {
  const chart = useChartPart('UsageDateAxis')
  if (!chart.ready) return null
  const hover = chart.hoverIndex
  const crossing = 0.534435 * chart.plot.width
  const hoverPosition = hover === null ? null : Math.max(30, Math.min(chart.plot.width - 30, chart.xCenter(hover)))
  return <div className="activity-chart-axis pointer-events-none absolute bottom-0 h-7 rounded-md border border-slate-200 bg-slate-100 text-sm leading-[26px] text-slate-600" style={{ left: margins.left, right: margins.right }}>
    {[0, 9, 19, 31].map((index) => {
      const position = Math.max(30, Math.min(chart.plot.width - 30, chart.xCenter(index)))
      const hidden = Math.abs(position - crossing) < 60 || (hoverPosition !== null && Math.abs(position - hoverPosition) < 60)
      return <span key={index} className="absolute whitespace-nowrap" style={{ left: position, transform: 'translateX(-50%)', visibility: hidden ? 'hidden' : 'visible' }}>{data[index].label.toUpperCase()}</span>
    })}
    <span className="activity-crossing absolute whitespace-nowrap font-semibold text-[#2A8CFF]" style={{ left: crossing, transform: 'translateX(-50%)', visibility: hoverPosition !== null && Math.abs(crossing - hoverPosition) < 60 ? 'hidden' : 'visible' }}>NOV 13</span>
    {hoverPosition !== null && hover !== null ? <span className="activity-hover-date absolute left-0 whitespace-nowrap rounded bg-blue-50 px-1 font-semibold text-[#0D2A4C]" style={{ transform: `translateX(${hoverPosition}px) translateX(-50%)` }}>{data[hover].label.toUpperCase()}</span> : null}
  </div>
}

UsageDateAxis.chartLayer = 'dom' as const

function ForecastMarkers({ activeIndex }: { activeIndex: number | null }) {
  const chart = useChartPart('ForecastMarkers')
  if (!chart.ready) return null
  return <g className="text-[#2A8CFF]">
    <path d={data.slice(0, 15).map((point, index) => `${index ? 'L' : 'M'}${chart.xCenter(index)},${chart.y(point.usage)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    <line x1={chart.xCenter(14)} x2={chart.xCenter(14)} y1={0} y2={chart.plot.height} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3 5" />
    {[14, 31].map((index) => <circle key={index} cx={chart.xCenter(index)} cy={chart.y(data[index].usage)} r={3} fill="white" stroke="currentColor" strokeWidth={1.5} />)}
    <text x={chart.xCenter(31)} y={chart.y(193) - 10} textAnchor="end" fill="currentColor" className="text-sm font-semibold">193%</text>
    {activeIndex !== null ? <g>
      <line x1={chart.xCenter(activeIndex)} x2={chart.xCenter(activeIndex)} y1={0} y2={chart.plot.height} stroke="#94a3b8" strokeWidth={1} strokeOpacity={0.6} />
      <circle cx={chart.xCenter(activeIndex)} cy={chart.y(data[activeIndex].usage)} r={5} fill="white" stroke="currentColor" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 4px #2A8CFF66)' }} />
    </g> : null}
  </g>
}

export function UsageForecast({ example }: { example: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  if (!example) return <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">Usage forecasts will appear when your workspace has a plan limit and billing period.</div>
  return <div className="min-w-0 rounded-xl bg-white p-5 sm:p-6">
    <div className="text-2xl font-bold tracking-tight text-[#0D2A4C]">86%</div>
    <p className="mt-1 text-sm leading-5 text-slate-600">Plan usage · Ends Nov 28 · <span className="font-semibold text-[#2A8CFF]">On pace to hit the limit Nov 13</span></p>
    <div className="relative mt-3 h-64 min-w-0" role="img" aria-label="Example usage at 86 percent, projected to reach 193 percent by November 28. The plan limit is 100 percent.">
      <AreaChart data={data} config={config} margins={margins} bloom="off" onHoverChange={setActiveIndex}>
        <Grid /><YAxis className="fill-current text-sm text-slate-600" tickFormatter={(value) => `${value}%`} /><ReferenceLine y={100} className="stroke-slate-400" /><UsageTooltip /><UsageDateAxis />
        <Area dataKey="usage" variant="hatched" strokeVariant="dashed" /><ForecastMarkers activeIndex={activeIndex} />
      </AreaChart>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ clipPath: 'inset(0 calc(54.8387% - 21.4839px) 0 0)' }}>
        <AreaChart data={data} config={config} margins={margins} bloom="off" interactive={false}>
          <Area dataKey="usage" variant="gradient" />
          <ForecastMarkers activeIndex={activeIndex} />
        </AreaChart>
      </div>
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>Averaging <strong className="text-[#0D2A4C]">6.2%</strong> a day</span>
      <div className="flex gap-3"><span><span className="mr-1 text-[#2A8CFF]">━</span>Usage</span><span><span className="mr-1 text-[#2A8CFF]">┄</span>Forecast</span><span><span className="mr-1">┄</span>Plan limit</span></div>
    </div>
  </div>
}


