import type { Command } from "../types.ts";

export const PLATFORMS = ["facebook"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const isPlatform = (word: string | undefined): word is Platform => (PLATFORMS as readonly string[]).includes(word ?? "");

export function resolvePlatformForm(
  argv: string[],
  find: (name: string) => Command | undefined,
): { ok: true; command: Command; argv: string[] } | { ok: false; error: string } | { ok: true; command: null } {
  const [first, second, ...rest] = argv;
  if (isPlatform(first)) {
    const command = second === undefined ? undefined : find(second);
    if (!command) return { ok: false, error: `log ${first}: name a command after the platform: log ${first} <command> …` };
    if (command.platform === "any") return { ok: false, error: `log ${first} ${command.name}: ${command.name} works on any platform and takes none: log ${[command.name, ...rest].join(" ")}` };
    return { ok: true, command, argv: command.platform === "byArgument" ? [first, ...rest] : rest };
  }
  const command = first === undefined ? undefined : find(first);
  if (!command) return { ok: true, command: null };
  if (command.platform === "any") return { ok: true, command, argv: [second, ...rest].filter((a): a is string => a !== undefined) };
  if (command.platform === "byArgument" && !isPlatform(second)) return { ok: true, command, argv: [second, ...rest].filter((a): a is string => a !== undefined) };
  const tail = isPlatform(second) ? rest : [second, ...rest].filter((a): a is string => a !== undefined);
  const platform = isPlatform(second) ? second : PLATFORMS[0];
  return { ok: false, error: `log ${command.name}: the platform comes first (rule 63): log ${[platform, command.name, ...tail].join(" ")}` };
}
