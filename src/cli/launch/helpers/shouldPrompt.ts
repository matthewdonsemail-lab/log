export interface LaunchTTY {
  stdinTTY: boolean | undefined;
  stdoutTTY: boolean | undefined;
}

/**
 * Interactive only when output is not piped/JSON and both streams are TTYs.
 * Pure, so tests can assert the never-prompt boundary without globals.
 */
export function shouldPrompt(json: boolean, tty: LaunchTTY): boolean {
  if (json) return false;
  return Boolean(tty.stdinTTY && tty.stdoutTTY);
}
