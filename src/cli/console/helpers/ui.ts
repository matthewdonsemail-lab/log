import type { CommandContext } from "../../runner/types.ts";

export interface ConsoleOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ConsoleUi {
  context: CommandContext;
  pick(message: string, options: ConsoleOption[]): Promise<string | null>;
  openUrl(url: string): boolean;
  webUrl(): Promise<string | null>;
}

export const BACK = "back";

export function msText(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;
}

export function utcText(value: string | number | null): string {
  if (value === null) return "none yet";
  return `${new Date(value).toISOString().slice(0, 19).replace("T", " ")} UTC`;
}
