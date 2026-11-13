import type { BarChartBlock, CalloutBlock, Cell, LineChartBlock, PersonListBlock, ReportBlock, ReportSpec, StatBlock, TableBlock } from "../types.ts";

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 10_000) return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

const shown = (value: number | string, unit?: string): string => `${esc(typeof value === "number" ? formatNumber(value) : value)}${unit ? `<small>${esc(unit)}</small>` : ""}`;

export function initials(name: string): string {
  const words = name.replace(/^@/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0][0], words[1][0]] : [...(words[0] ?? "?")].slice(0, 2);
  return letters.join("").toUpperCase();
}

export function hueOf(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 200 + (hash % 40);
}

const titleOf = (title?: string): string => (title ? `<h3 class="cardTitle">${esc(title)}</h3>` : "");

function statHtml(block: StatBlock): string {
  const tiles = block.items.map((s, i) => `<div class="stat${i === 0 ? " lead" : ""}"><span class="statLabel">${esc(s.label)}</span><strong class="statValue${typeof s.value === "string" ? " word" : ""}">${shown(s.value, s.unit)}</strong>${s.delta ? `<span class="statDelta" data-tone="${/^[-−]/.test(s.delta) ? "down" : "up"}">${esc(s.delta)}</span>` : ""}${s.hint ? `<span class="statHint">${esc(s.hint)}</span>` : ""}</div>`);
  return `<section class="stats" data-block="stat">${tiles.join("")}</section>`;
}

function horizontalBars(block: BarChartBlock): string {
  const max = Math.max(...block.data.map((d) => d.value)) || 1;
  const rows = block.data.map((d) => `<li class="barRow"${d.hint ? ` title="${esc(d.hint)}"` : ""}><span class="barLabel">${esc(d.label)}</span><span class="barTrack"><span class="barFill" style="width:${((d.value / max) * 100).toFixed(2)}%"></span></span><span class="barValue">${shown(d.value)}</span></li>`);
  return `<ol class="bars">${rows.join("")}</ol>`;
}

const W = 640;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 34, left: 44 };

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].map((m) => m * step).find((m) => m >= value) ?? value;
}

function gridLines(max: number, unit?: string): string {
  return [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const y = PAD.top + (1 - f) * (H - PAD.top - PAD.bottom);
      return `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${y}" y2="${y}"/><text class="axis" x="${PAD.left - 8}" y="${y + 4}" text-anchor="end">${esc(formatNumber(max * f))}${f === 1 && unit ? ` ${esc(unit)}` : ""}</text>`;
    })
    .join("");
}

function ticks<T>(items: readonly T[], most: number): number[] {
  if (items.length <= most) return items.map((_, i) => i);
  const step = (items.length - 1) / (most - 1);
  return Array.from({ length: most }, (_, i) => Math.round(i * step));
}

function verticalBars(block: BarChartBlock): string {
  const max = niceMax(Math.max(...block.data.map((d) => d.value)));
  const inner = W - PAD.left - PAD.right;
  const slot = inner / block.data.length;
  const width = Math.max(2, Math.min(56, slot * 0.66));
  const labelled = new Set(ticks(block.data, 12));
  const bars = block.data
    .map((d, i) => {
      const h = (d.value / max) * (H - PAD.top - PAD.bottom);
      const x = PAD.left + i * slot + (slot - width) / 2;
      const label = labelled.has(i) ? `<text class="axis" x="${x + width / 2}" y="${H - PAD.bottom + 16}" text-anchor="middle">${esc(d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label)}</text>` : "";
      return `<rect class="vbar" x="${x.toFixed(1)}" y="${(H - PAD.bottom - h).toFixed(1)}" width="${width.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="4"><title>${esc(d.label)}: ${esc(formatNumber(d.value))}</title></rect>${label}`;
    })
    .join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(block.title ?? "Bar chart")}">${gridLines(max, block.unit)}${bars}</svg>`;
}

function barHtml(block: BarChartBlock): string {
  const body = (block.orientation ?? "horizontal") === "horizontal" ? horizontalBars(block) : verticalBars(block);
  return `<section class="card" data-block="barChart">${titleOf(block.title)}${body}</section>`;
}

function lineHtml(block: LineChartBlock): string {
  const max = niceMax(Math.max(...block.series.flatMap((s) => s.values)));
  const inner = W - PAD.left - PAD.right;
  const xAt = (i: number) => PAD.left + (block.x.length === 1 ? inner / 2 : (i / (block.x.length - 1)) * inner);
  const yAt = (v: number) => PAD.top + (1 - Math.max(0, v) / max) * (H - PAD.top - PAD.bottom);
  const lines = block.series
    .map((s, n) => {
      const points = s.values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`);
      const area = n === 0 && block.series.length === 1 ? `<polygon class="area" points="${xAt(0).toFixed(1)},${H - PAD.bottom} ${points.join(" ")} ${xAt(s.values.length - 1).toFixed(1)},${H - PAD.bottom}"/>` : "";
      return `${area}<polyline class="line" data-series="${n}" points="${points.join(" ")}"><title>${esc(s.name)}</title></polyline>`;
    })
    .join("");
  const labels = ticks(block.x, 7).map((i) => `<text class="axis" x="${xAt(i).toFixed(1)}" y="${H - PAD.bottom + 16}" text-anchor="${i === 0 ? "start" : i === block.x.length - 1 ? "end" : "middle"}">${esc(block.x[i])}</text>`).join("");
  const legend = block.series.length > 1 ? `<ul class="legend">${block.series.map((s, n) => `<li><i data-series="${n}"></i>${esc(s.name)}</li>`).join("")}</ul>` : "";
  return `<section class="card" data-block="lineChart">${titleOf(block.title)}${legend}<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(block.title ?? "Line chart")}">${gridLines(max, block.unit)}${lines}${labels}</svg></section>`;
}

function cellHtml(value: Cell | undefined, format?: "text" | "number" | "date"): string {
  if (value === null || value === undefined || value === "") return `<span class="empty">–</span>`;
  if (typeof value === "number") return esc(formatNumber(value));
  if (format === "date" && !Number.isNaN(Date.parse(value))) return esc(value.slice(0, 16).replace("T", " "));
  return esc(value);
}

function tableHtml(block: TableBlock): string {
  const right = (c: TableBlock["columns"][number]) => c.align === "right" || (c.align === undefined && c.format === "number");
  const head = block.columns.map((c) => `<th${right(c) ? ' class="num"' : ""} scope="col">${esc(c.label)}</th>`).join("");
  const rows = block.rows.map((row) => `<tr>${block.columns.map((c) => `<td${right(c) ? ' class="num"' : ""}>${cellHtml(row[c.key], c.format)}</td>`).join("")}</tr>`).join("");
  const body = rows || `<tr><td class="empty" colspan="${block.columns.length}">No rows</td></tr>`;
  return `<section class="card" data-block="table">${titleOf(block.title)}<div class="tableWrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></section>`;
}

function personHtml(block: PersonListBlock): string {
  const max = Math.max(0, ...block.people.map((p) => p.count ?? 0)) || 1;
  const rows = block.people.map((p, i) => {
    const handle = p.handle ? `@${p.handle.replace(/^@/, "")}` : "";
    const meter = p.count !== undefined ? `<span class="personMeter"><span style="width:${((p.count / max) * 100).toFixed(2)}%"></span></span>` : "";
    return `<li class="person"><span class="rank">${i + 1}</span><span class="avatar" style="--hue:${hueOf(p.handle ?? p.name)}" aria-hidden="true">${esc(initials(p.name))}</span><span class="personText"><strong>${esc(p.name)}</strong>${handle || p.note ? `<span>${esc([handle, p.note].filter(Boolean).join(" · "))}</span>` : ""}${meter}</span>${p.count !== undefined ? `<span class="personCount">${shown(p.count, block.unit)}</span>` : ""}</li>`;
  });
  return `<section class="card" data-block="personList">${titleOf(block.title)}<ol class="people">${rows.join("")}</ol></section>`;
}

const CALLOUT_ICON: Record<NonNullable<CalloutBlock["tone"]>, string> = {
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
};

function calloutHtml(block: CalloutBlock): string {
  const tone = block.tone ?? "info";
  return `<aside class="callout" data-block="callout" data-tone="${tone}"><span class="calloutIcon">${CALLOUT_ICON[tone]}</span><div>${block.title ? `<strong>${esc(block.title)}</strong>` : ""}<p>${esc(block.text)}</p></div></aside>`;
}

export function blockHtml(block: ReportBlock): string {
  if (block.type === "heading") return block.level === 3 ? `<h3 class="sub" data-block="heading">${esc(block.text)}</h3>` : `<h2 class="section" data-block="heading">${esc(block.text)}</h2>`;
  if (block.type === "text") return `<p class="prose" data-block="text">${esc(block.text)}</p>`;
  if (block.type === "stat") return statHtml(block);
  if (block.type === "barChart") return barHtml(block);
  if (block.type === "lineChart") return lineHtml(block);
  if (block.type === "table") return tableHtml(block);
  if (block.type === "personList") return personHtml(block);
  return calloutHtml(block);
}

export function reportBodyHtml(spec: ReportSpec): string {
  return spec.blocks.map(blockHtml).join("");
}
