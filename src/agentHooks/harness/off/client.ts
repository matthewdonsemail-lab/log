import { deleteState, getState, putState } from '../../../storage/state/index';

export interface HarnessOffState {
  by: string;
  at: string;
  host: string;
}

export function harnessOffState(): HarnessOffState | null {
  return getState<HarnessOffState>('harnessOff', 'all')?.body ?? null;
}

export function harnessOff(): boolean {
  return harnessOffState() !== null;
}

export function setHarnessOff(off: boolean, by: string, host = 'harness', now: number = Date.now()): HarnessOffState | null {
  if (!off) {
    deleteState('harnessOff', 'all');
    return null;
  }
  const body: HarnessOffState = { by, at: new Date(now).toISOString(), host };
  putState('harnessOff', 'all', body, now);
  return body;
}

export function harnessOffLine(state: HarnessOffState | null = harnessOffState()): string {
  return state
    ? `log harness: off since ${state.at}, asked by ${state.by} for ${state.host}; log harness on --by <who> restores hooks, pushes and tools`
    : 'log harness: on; hooks, pushes and tools are active';
}
