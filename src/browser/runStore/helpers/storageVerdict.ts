export const RUNS_WARN_BYTES = 2e9

export const DISK_WARN_BYTES = 5e9

const gb = (bytes: number) => `${(bytes / 1e9).toFixed(1)} GB`

export function storageVerdict(runsBytes: number, freeBytes: number | null): string | null {
  const lines: string[] = []
  if (runsBytes > RUNS_WARN_BYTES) lines.push(`~/.logCli/runs holds ${gb(runsBytes)} (over ${gb(RUNS_WARN_BYTES)})`)
  if (freeBytes !== null && freeBytes < DISK_WARN_BYTES) lines.push(`the disk has ${gb(freeBytes)} free (AdsPower refuses to start a browser near a full disk)`)
  if (!lines.length) return null
  return `log-cli storage: ${lines.join('; ')}. See what may go with \`log runs\`, then \`log runs prune --apply\`: it deletes only runs rea has settled and the request docs hold, keeping each one's findings.md, steps.jsonl and domains.`
}
