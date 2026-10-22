import type { Command } from "../types.ts";

/** The platforms log-cli acts on. The first word after `log` when a command acts on one (rule 63). */
export const PLATFORMS = ["facebook"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const isPlatform = (word: string | undefined): word is Platform => (PLATFORMS as readonly string[]).includes(word ?? "");

/**
 * `log <platform> <command> …` (rule 63) → the command and the argv it runs with: a Facebook-only command gets
 * what follows its name; a command scoped by its argument (`warmup`) gets the platform back as its first word.
 * A form without the platform, or one that puts it after the command, is refused with the form it became; a
 * command that works on any platform is refused with a platform in front of it. Pure.
 */
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
  // A warm-up form with no platform at all (`log warmup plan`): the warm-up refuses it with the exact form it moved to.
  if (command.platform === "byArgument" && !isPlatform(second)) return { ok: true, command, argv: [second, ...rest].filter((a): a is string => a !== undefined) };
  // The platform after the command (`log warmup facebook reel`) or missing (`log connect --account x`).
  const tail = isPlatform(second) ? rest : [second, ...rest].filter((a): a is string => a !== undefined);
  const platform = isPlatform(second) ? second : PLATFORMS[0];
  return { ok: false, error: `log ${command.name}: the platform comes first (rule 63): log ${[platform, command.name, ...tail].join(" ")}` };
}
