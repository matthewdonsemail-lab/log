import { commandKey, isPlatform } from "../../../cli/runner/helpers/platforms.ts";
import type { Command } from "../../../cli/runner/types.ts";

type GateFields = Pick<Command, "name" | "platform" | "terminalOnly" | "longRunning" | "noPrompt">;

export function terminalOnlyOf(command: Pick<Command, "terminalOnly">): string | null {
  return command.terminalOnly ?? null;
}

export function isLongRunning(command: Pick<Command, "longRunning">): boolean {
  return command.longRunning === true;
}

export function noPromptOf(command: Pick<Command, "noPrompt">): string | null {
  return command.noPrompt ?? null;
}

export function terminalOnlyByKey(commands: readonly GateFields[]): Record<string, string> {
  return Object.fromEntries(commands.flatMap((command) => (command.terminalOnly ? [[commandKey(command), command.terminalOnly]] : [])));
}

export function longRunningKeys(commands: readonly GateFields[]): Set<string> {
  return new Set(commands.filter(isLongRunning).map(commandKey));
}

export function noPromptByKey(commands: readonly GateFields[]): Record<string, string> {
  return Object.fromEntries(commands.flatMap((command) => (command.noPrompt ? [[commandKey(command), command.noPrompt]] : [])));
}

export function commandWordsLabel(command: Pick<Command, "name" | "platform">): string {
  return isPlatform(command.platform) ? `${command.platform} ${command.name}` : command.platform === "byArgument" ? `<platform> ${command.name}` : command.name;
}
