export interface LaunchTTY {
  stdinTTY: boolean | undefined;
  stdoutTTY: boolean | undefined;
}

export function shouldPrompt(json: boolean, tty: LaunchTTY): boolean {
  if (json) return false;
  return Boolean(tty.stdinTTY && tty.stdoutTTY);
}
