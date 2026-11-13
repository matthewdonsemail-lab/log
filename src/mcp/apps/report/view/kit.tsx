import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { faSvg } from "./icons.ts";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export type ToolCaller = (tool: string, args: Record<string, unknown>) => Promise<unknown>;

export interface KitHost {
  call: ToolCaller;
  data: Record<string, unknown>;
}

const HostContext = createContext<KitHost>({ call: async () => Promise.reject(new Error("This view can't call log tools here")), data: {} });

export const KitProvider = HostContext.Provider;

export function call(tool: string, args: Record<string, unknown> = {}): Promise<unknown> {
  return activeHost.call(tool, args);
}

let activeHost: KitHost = { call: async () => Promise.reject(new Error("This view can't call log tools here")), data: {} };

export function setHost(host: KitHost): void {
  activeHost = host;
}

export function useData<T = unknown>(name: string): T | undefined {
  return useContext(HostContext).data[name] as T | undefined;
}

export interface ToolQuery<T> {
  data: T | undefined;
  error?: Error;
  loading: boolean;
  reload: () => void;
}

export function useTool<T = unknown>(tool: string, args: Record<string, unknown> = {}, options: { enabled?: boolean; refresh?: number } = {}): ToolQuery<T> {
  const host = useContext(HostContext);
  const key = JSON.stringify([tool, args]);
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: options.enabled !== false });
  const tick = useRef(0);
  const run = useCallback(() => {
    if (options.enabled === false) return;
    const mine = ++tick.current;
    setState((s) => ({ ...s, loading: s.data === undefined }));
    host
      .call(tool, args)
      .then((data) => mine === tick.current && setState({ data: data as T, loading: false }))
      .catch((error: unknown) => mine === tick.current && setState((s) => ({ ...s, error: error instanceof Error ? error : new Error(String(error)), loading: false })));
  }, [key, options.enabled, host]);
  useEffect(() => {
    run();
    if (!options.refresh) return;
    const timer = setInterval(run, Math.max(5000, options.refresh));
    return () => clearInterval(timer);
  }, [run, options.refresh]);
  return { data: state.data, error: state.error, loading: state.loading, reload: run };
}

export function Page({ title, subtitle, actions, children }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="sb-page">
      {(title || actions) && (
        <header className="sb-page-head">
          <div>
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="sb-row">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
}

export function Card({ title, actions, children, pad = true, style }: { title?: ReactNode; actions?: ReactNode; children?: ReactNode; pad?: boolean; style?: CSSProperties }) {
  return (
    <section className="sb-card" style={style}>
      {(title || actions) && (
        <header className="sb-card-head">
          <h2>{title}</h2>
          {actions && <div className="sb-row">{actions}</div>}
        </header>
      )}
      <div className={cx("sb-card-body", !pad && "flush")}>{children}</div>
    </section>
  );
}

export const Row = ({ children, gap = 8, align = "center", wrap, style }: { children?: ReactNode; gap?: number; align?: CSSProperties["alignItems"]; wrap?: boolean; style?: CSSProperties }) => <div style={{ display: "flex", alignItems: align, gap, flexWrap: wrap ? "wrap" : undefined, minWidth: 0, ...style }}>{children}</div>;
export const Stack = ({ children, gap = 12, style }: { children?: ReactNode; gap?: number; style?: CSSProperties }) => <div style={{ display: "flex", flexDirection: "column", gap, minWidth: 0, ...style }}>{children}</div>;
export const Grid = ({ children, min = 200, gap = 12 }: { children?: ReactNode; min?: number; gap?: number }) => <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`, gap }}>{children}</div>;

export type Tone = "neutral" | "good" | "bad" | "warn" | "live" | "accent";
export const Badge = ({ children, tone = "neutral" }: { children?: ReactNode; tone?: Tone }) => <span className={cx("sb-badge", tone)}>{children}</span>;

export const Spinner = () => <span className="sb-spinner" aria-label="Loading" />;

export const Empty = ({ title, children, action }: { title?: ReactNode; children?: ReactNode; action?: ReactNode }) => (
  <div className="sb-empty">
    {title && <strong>{title}</strong>}
    {children && <p>{children}</p>}
    {action}
  </div>
);

export const ErrorNote = ({ error, retry }: { error?: Error | string | null; retry?: () => void }) => {
  if (!error) return null;
  return (
    <div className="sb-error">
      <span>{typeof error === "string" ? error : error.message}</span>
      {retry && (
        <span className="sb-error-acts">
          <button className="sb-btn sm ghost" onClick={retry}>
            Try again
          </button>
        </span>
      )}
    </div>
  );
};

export function Query<T>({ q, empty, children }: { q: ToolQuery<T>; empty?: ReactNode; children: (data: T) => ReactNode }) {
  if (q.loading)
    return (
      <div className="sb-empty">
        <Spinner />
      </div>
    );
  if (q.error && q.data === undefined) return <ErrorNote error={q.error} retry={q.reload} />;
  if (q.data === undefined || q.data === null || (Array.isArray(q.data) && !q.data.length)) return <>{empty ?? <Empty title="Nothing here" />}</>;
  return <>{children(q.data)}</>;
}

export function Stat({ label, value, hint, tone }: { label: ReactNode; value: ReactNode; hint?: ReactNode; tone?: Tone }) {
  return (
    <div className="sb-stat">
      <span className="sb-stat-label">{label}</span>
      <span className={cx("sb-stat-value", tone)}>{value}</span>
      {hint && <span className="sb-stat-hint">{hint}</span>}
    </div>
  );
}

export interface Column<T> {
  key: string;
  title?: ReactNode;
  render?: (row: T) => ReactNode;
  width?: number | string;
  align?: "left" | "right";
}

export function Table<T extends Record<string, any>>({ rows, columns, limit }: { rows: T[]; columns: Column<T>[]; limit?: number }) {
  const [all, setAll] = useState(false);
  const shown = limit && !all ? rows.slice(0, limit) : rows;
  return (
    <>
      <table className="sb-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width, textAlign: c.align }}>
                {c.title ?? c.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align }}>
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {limit && rows.length > limit && (
        <button className="sb-btn sm ghost sb-more" onClick={() => setAll(!all)}>
          {all ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </>
  );
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="sb-tabs" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className={o.value === value ? "on" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Details({ summary, children, open: initial }: { summary: ReactNode; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(!!initial);
  return (
    <div className={cx("sb-details", open && "open")}>
      <button onClick={() => setOpen(!open)}>
        <span className="sb-caret">›</span>
        {summary}
      </button>
      {open && <div className="sb-details-body">{children}</div>}
    </div>
  );
}

export function Icon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const svg = useMemo(() => faSvg(name, size), [name, size]);
  if (!svg) return null;
  return <span className="sb-icon" style={{ width: size, height: size, color }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const words = name.replace(/^@/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = (words.length > 1 ? `${words[0][0]}${words[1][0]}` : [...(words[0] ?? "?")].slice(0, 2).join("")).toUpperCase();
  return (
    <span className="sb-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
      {letters}
    </span>
  );
}

export function rel(date: string | number | Date | null | undefined, now = Date.now()): string {
  if (!date) return "";
  const s = Math.round((now - new Date(date).getTime()) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const Time = ({ value }: { value: string | number | Date | null | undefined }) => (value ? <time title={new Date(value).toLocaleString()}>{rel(value)}</time> : null);

export const fmt = (n: number | null | undefined, opts: Intl.NumberFormatOptions = {}) =>
  n === null || n === undefined || Number.isNaN(n) ? "–" : new Intl.NumberFormat("en-US", { notation: Math.abs(n) >= 10000 ? "compact" : "standard", maximumFractionDigits: 1, ...opts }).format(n);

export interface Series {
  name?: string;
  values: number[];
  color?: string;
}

const PALETTE = ["var(--sb-accent)", "var(--sb-blue)", "var(--sb-good)", "var(--sb-violet)", "var(--sb-bad)"];

export function LineChart({ series, labels, height = 180, area = true }: { series: Series[]; labels?: string[]; height?: number; area?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = Math.max(0, ...series.map((s) => s.values.length));
  const all = series.flatMap((s) => s.values);
  if (!n || !all.length) return <Empty>No data</Empty>;
  const max = Math.max(...all, 0) || 1;
  const min = Math.min(...all, 0);
  const W = 600;
  const H = height;
  const pad = { l: 0, r: 0, t: 10, b: labels ? 22 : 2 };
  const x = (i: number) => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (n - 1));
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
  const path = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const ticks = labels ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i) : [];
  return (
    <div className="sb-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.max(0, Math.min(n - 1, Math.round((((e.clientX - r.left) / r.width) * W - pad.l) / ((W - pad.l - pad.r) / Math.max(1, n - 1))))));
        }}
      >
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad.l} x2={W - pad.r} y1={pad.t + t * (H - pad.t - pad.b)} y2={pad.t + t * (H - pad.t - pad.b)} className="sb-chart-grid" />
        ))}
        {series.map((s, si) => {
          const color = s.color ?? PALETTE[si % PALETTE.length];
          return (
            <g key={si}>
              {area && series.length === 1 && <path d={`${path(s.values)}L${x(s.values.length - 1)},${H - pad.b}L${x(0)},${H - pad.b}Z`} fill={color} opacity={0.1} />}
              <path d={path(s.values)} fill="none" stroke={color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </g>
          );
        })}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="sb-chart-cursor" vectorEffect="non-scaling-stroke" />}
      </svg>
      {labels && (
        <div className="sb-chart-axis">
          {ticks.map((i) => (
            <span key={i}>{labels[i]}</span>
          ))}
        </div>
      )}
      <div className="sb-chart-legend">
        {hover !== null && labels?.[hover] && <strong>{labels[hover]}</strong>}
        {series.map((s, si) => (
          <span key={si}>
            <i style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />
            {s.name ?? `Series ${si + 1}`}
            {hover !== null && <b>{fmt(s.values[hover])}</b>}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data, height = 180, color }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  if (!data.length) return <Empty>No data</Empty>;
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  return (
    <div className="sb-bars" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="sb-bar" title={`${d.label}: ${fmt(d.value)}`}>
          <span className="sb-bar-value">{fmt(d.value)}</span>
          <div style={{ height: `${Math.max(1, (d.value / max) * 100)}%`, background: color ?? "var(--sb-accent)" }} />
          <span className="sb-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Bars({ data, unit }: { data: { label: ReactNode; value: number; hint?: ReactNode }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  return (
    <div className="sb-hbars">
      {data.map((d, i) => (
        <div key={i} className="sb-hbar">
          <span className="sb-hbar-label">{d.label}</span>
          <span className="sb-hbar-track">
            <span style={{ width: `${Math.max(1, (d.value / max) * 100)}%` }} />
          </span>
          <span className="sb-hbar-value">
            {fmt(d.value)}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, width = 96, height = 24, color = "var(--sb-accent)" }: { values: number[]; width?: number | string; height?: number; color?: string }) {
  if (values.length < 2) return <svg width={width} height={height} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const W = 100;
  const d = values.map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * W).toFixed(2)},${(height - 2 - ((v - min) / (max - min || 1)) * (height - 4)).toFixed(1)}`).join("");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="sb-spark">
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Quote({ children }: { children?: ReactNode }) {
  return <blockquote className="sb-quote">{children}</blockquote>;
}
