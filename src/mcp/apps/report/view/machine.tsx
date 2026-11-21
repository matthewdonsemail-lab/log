import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { drawMachine, fitDirection, shortDate } from "../../../../relate/machine/render/svg.ts";
import { machineCss } from "../../../../relate/machine/theme.ts";
import { MACHINE_PLATFORMS, PLATFORM_MARKS, PLATFORM_NAMES } from "../../../../relate/machine/types.ts";
import type { MachineAccount, MachineDirection, MachinePlatform, MachineState, MachineTransition, StateMachineBlock } from "../../../../relate/machine/types.ts";

const MIN_SCALE = 0.72;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rmField">
      <label>{label}</label>
      <div>{children}</div>
    </div>
  );
}

function Move({ t, names }: { t: MachineTransition; names: Map<string, string> }) {
  return (
    <li data-next={t.next ? "true" : "false"}>
      <strong>
        {t.next ? "Next: " : ""}
        {t.event}
        {typeof t.count === "number" ? ` ×${t.count}` : ""}
      </strong>
      {t.tool && <code>{t.tool}</code>}
      <small>
        {names.get(t.from)} → {names.get(t.to)}
        {t.at ? ` · ${shortDate(t.at)}` : ""}
        {t.note ? ` · ${t.note}` : ""}
      </small>
    </li>
  );
}

function Panel({ machine, selected, names }: { machine: StateMachineBlock; selected: string | null; names: Map<string, string> }) {
  const state = machine.states.find((s) => s.id === selected) as MachineState | undefined;
  const edge = machine.transitions.find((t) => t.id === selected);
  if (edge)
    return (
      <aside className="rmPanel" aria-label="Transition details">
        <span className="rmPanelKind">Transition details</span>
        <h3>{edge.event}</h3>
        <Field label="From → to">{`${names.get(edge.from)} → ${names.get(edge.to)}`}</Field>
        {edge.tool && <Field label="log tool">{edge.tool}</Field>}
        {edge.platform && <Field label="Platform">{edge.platform}</Field>}
        <Field label="Who moves">{edge.by === "them" ? "They do" : "You do"}</Field>
        {edge.at ? <Field label="When">{new Date(edge.at).toISOString().slice(0, 16).replace("T", " ")}</Field> : null}
        {typeof edge.count === "number" && <Field label="People who took it">{edge.count}</Field>}
        {edge.note && <Field label="What happened">{edge.note}</Field>}
      </aside>
    );
  if (!state)
    return (
      <aside className="rmPanel" aria-label="Machine details">
        <span className="rmPanelKind">Machine</span>
        <h3>{machine.title ?? "State machine"}</h3>
        {machine.summary && <Field label="Summary">{machine.summary}</Field>}
      </aside>
    );
  const out = machine.transitions.filter((t) => t.from === state.id);
  const into = machine.transitions.filter((t) => t.to === state.id && (t.taken || t.next));
  return (
    <aside className="rmPanel" aria-label="State details">
      <span className="rmPanelKind">{state.current ? "Where it stands now" : "State details"}</span>
      <h3>{state.label}</h3>
      {state.explain && <div className="rmField rmWhy"><label>What it means</label><div>{state.explain}</div></div>}
      {state.note && <Field label="Description">{state.note}</Field>}
      {typeof state.count === "number" && <Field label="People here">{state.count}</Field>}
      {(state.details ?? []).map((d, i) => (
        <Field key={i} label={d.label}>
          {d.value}
        </Field>
      ))}
      {out.length > 0 && (
        <div className="rmField">
          <label>Moves from here</label>
          <ul className="rmMoves">
            {out.map((t) => (
              <Move key={t.id} t={t} names={names} />
            ))}
          </ul>
        </div>
      )}
      {into.length > 0 && (
        <div className="rmField">
          <label>How it got here</label>
          <ul className="rmMoves">
            {into.map((t) => (
              <Move key={t.id} t={t} names={names} />
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function Toggles({ given, platform, choose }: { given: StateMachineBlock; platform: MachinePlatform; choose: (p: MachinePlatform) => void }) {
  const views = new Map((given.platforms ?? []).map((v) => [v.platform, v]));
  return (
    <div className="rmToggles" role="toolbar" aria-label="Platform">
      {MACHINE_PLATFORMS.map((p) => {
        const view = views.get(p);
        return (
          <button key={p} type="button" aria-pressed={platform === p} disabled={!view} onClick={(e) => { e.stopPropagation(); choose(p); }}>
            {PLATFORM_NAMES[p]}
            <small>{view ? view.count.toLocaleString("en-US") : 0}</small>
          </button>
        );
      })}
    </div>
  );
}

function Accounts({ accounts, top }: { accounts: MachineAccount[]; top: number }) {
  return (
    <div className="rmAccounts" aria-label="Accounts" style={{ top }}>
      {accounts.map((a) => (
        <span key={`${a.platform}:${a.handle}`} data-link={a.link}>
          <b>{PLATFORM_MARKS[a.platform] ?? a.platform}</b>@{a.handle.replace(/^@/, "")}{a.link === "suggested" ? " · suggested link" : ""}
        </span>
      ))}
    </div>
  );
}

export function StateMachine({ machine: given, theme }: { machine: StateMachineBlock; theme?: "light" | "dark" }) {
  const [platform, setPlatform] = useState<MachinePlatform>(given.platform ?? "all");
  const machine = useMemo(() => {
    const view = given.platforms?.find((v) => v.platform === platform);
    return view ? { ...given, states: view.states, transitions: view.transitions, summary: view.summary ?? given.summary } : given;
  }, [given, platform]);
  const showAccounts = (given.accounts?.length ?? 0) > 1 || (given.accounts ?? []).some((a) => a.link === "suggested");
  const current = machine.states.find((s) => s.current)?.id ?? null;
  const [selected, setSelected] = useState<string | null>(null);
  const [direction, setDirection] = useState<MachineDirection>(() => fitDirection(machine));
  const [actual, setActual] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const names = useMemo(() => new Map(machine.states.map((s) => [s.id, s.label])), [machine]);
  const drawing = useMemo(() => drawMachine(machine, { direction, selected }), [machine, direction, selected]);
  useEffect(() => {
    const el = canvas.current;
    if (!el || machine.direction || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const wide = drawMachine(machine, { direction: "right" }).width;
      setDirection(el.clientWidth / wide >= MIN_SCALE ? "right" : "down");
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(el);
    return () => watch.disconnect();
  }, [machine]);
  const pick = (target: EventTarget | null) => {
    const hit = (target as Element | null)?.closest?.("[data-id]");
    setSelected(hit ? hit.getAttribute("data-id") : null);
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") setSelected(null);
    if (event.key === "Enter" || event.key === " ") {
      pick(event.target);
      event.preventDefault();
    }
  };
  const width = actual ? drawing.width : undefined;
  const crumb = machine.states.find((s) => s.id === selected)?.label ?? machine.transitions.find((t) => t.id === selected)?.event;
  return (
    <div className={theme ? `rmMachine ${theme}` : "rmMachine"} data-theme={theme} data-selected={selected ?? undefined} data-view={machine.view}>
      <style>{machineCss()}</style>
      <div className="rmCanvas" ref={canvas} style={actual ? { overflowX: "scroll" } : undefined} onClick={(e: MouseEvent<HTMLDivElement>) => pick(e.target)} onKeyDown={onKey}>
        <div className="rmCrumb">
          Relate › <b>{machine.view ?? "machine"}</b>
          {crumb ? <> › <b>{crumb}</b></> : null}
        </div>
        {given.platforms && <Toggles given={given} platform={platform} choose={(p) => { setPlatform(p); setSelected(null); }} />}
        {showAccounts && <Accounts accounts={given.accounts!} top={given.platforms ? 80 : 44} />}
        <div style={{ padding: `${44 + (given.platforms ? 36 : 0) + (showAccounts ? 30 : 0) + 8}px 0 52px`, width: width ? `${width}px` : "100%", maxWidth: width ? undefined : `${drawing.width}px`, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: drawing.svg.replace("<svg ", `<svg style="width:100%;height:auto" `) }} />
        <div className="rmBar" role="toolbar" aria-label="Canvas">
          <button type="button" aria-pressed={!actual} onClick={(e) => { e.stopPropagation(); setActual(false); }}>Fit</button>
          <button type="button" aria-pressed={actual} onClick={(e) => { e.stopPropagation(); setActual(true); }}>100%</button>
          <button type="button" aria-pressed={false} aria-label="Turn the layout" onClick={(e) => { e.stopPropagation(); setDirection(direction === "right" ? "down" : "right"); }}>{direction === "right" ? "→" : "↓"}</button>
        </div>
      </div>
      <Panel machine={machine} selected={selected ?? current} names={names} />
    </div>
  );
}
