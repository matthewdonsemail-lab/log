/** `~/.logCli/runs` over this many bytes is said in the agent's context (matt, 2026-10-22). */
export const RUNS_WARN_BYTES = 2e9

/** The disk with less than this free is said too: AdsPower refuses to start a browser near a full disk. */
export const DISK_WARN_BYTES = 5e9

const gb = (bytes: number) => `${(bytes / 1e9).toFixed(1)} GB`

/** What the storage hook says, or null when there is room. Pure. */
export function storageVerdict(runsBytes: number, freeBytes: number | null): string | null {
  const lines: string[] = []
  if (runsBytes > RUNS_WARN_BYTES) lines.push(`~/.logCli/runs holds ${gb(runsBytes)} (over ${gb(RUNS_WARN_BYTES)})`)
  if (freeBytes !== null && freeBytes < DISK_WARN_BYTES) lines.push(`the disk has ${gb(freeBytes)} free (AdsPower refuses to start a browser near a full disk)`)
  if (!lines.length) return null
  return `log-cli storage: ${lines.join('; ')}. See what may go with \`log runs\`, then \`log runs prune --apply\`: it deletes only runs rea has settled and the request docs hold, keeping each one's findings.md, steps.jsonl and domains.`
}
