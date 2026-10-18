import { ERROR_CATALOG } from "../../../errors/catalog/index.ts";
import type { ErrorCode, ErrorEntry, ErrorLayer } from "../../../errors/catalog/index.ts";
import { monitorMachine } from "../../../marketplace/monitor/index.ts";
import { publishMachine } from "../../../marketplace/publish/index.ts";
import { toMermaid } from "../../../observability/graph/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

export const LAYERS: ErrorLayer[] = ["account", "photo", "form", "captcha", "runtime", "auth"];

/** The machines `log graph` draws. */
export const MACHINES = { publish: publishMachine, monitor: monitorMachine } as const;

export function catalogEntries(layer?: ErrorLayer): [ErrorCode, ErrorEntry][] {
  return (Object.entries(ERROR_CATALOG) as [ErrorCode, ErrorEntry][]).filter(([, entry]) => !layer || entry.layer === layer);
}

/** Where a code ends up, in one cell: `publish→blocked, monitor→resting`. Pure. */
export function endsText(entry: ErrorEntry): string {
  const ends = [
    entry.publish && `publish→${entry.publish}`,
    entry.monitor && `monitor→${entry.monitor}`,
    entry.captcha && `captcha→${entry.captcha}`,
  ].filter(Boolean);
  return ends.length ? ends.join(", ") : "command exits";
}

/** Terminal table of the catalog (or one layer). Pure. */
export function renderCatalogTable(layer?: ErrorLayer): string {
  const rows = catalogEntries(layer).map(([code, entry]) => [code, entry.layer, entry.retryable ? "yes" : "no", endsText(entry), entry.meaning]);
  return renderTable(["Code", "Layer", "Retry", "Ends in", "Meaning"], rows);
}

/** One code in full. Pure. */
export function renderCatalogEntry(code: ErrorCode): string {
  const entry = ERROR_CATALOG[code] as ErrorEntry;
  return [
    code,
    `  Layer      ${entry.layer}`,
    `  Meaning    ${entry.meaning}`,
    `  Retryable  ${entry.retryable ? "yes, it can clear by itself" : "no, a person acts"}`,
    `  Raised in  ${entry.raisedIn.join(", ")}`,
    `  Ends in    ${endsText(entry)}`,
    `  Do         ${entry.action}`,
  ].join("\n");
}

const cell = (text: string) => text.replace(/\|/g, "\\|");

/**
 * `docs/errorCatalog.md`: the machines as Mermaid, then every code by layer.
 * Generated (`bun run errors:export`), and a test fails when it's stale. Pure.
 */
export function renderCatalogMarkdown(): string {
  const lines = [
    "# Error catalog",
    "",
    "Generated from `src/errors/catalog/types.ts` by `bun run errors:export`. Don't edit by hand:",
    "change the catalog, re-export, and `catalog.test.ts` checks the two match.",
    "",
    "Every failure in log-cli carries one of these codes, whether it starts in TypeScript or in",
    "`python/logWorker.py` / `python/publishSession.py`. A code the catalog doesn't have becomes",
    "`uncatalogued` at the boundary, so nothing unknown passes as known.",
    "",
    "- **Retry**: yes means it can clear by itself (a retry, or time). No means a person acts.",
    "- **Ends in**: the state each machine goes to. A publish failure always passes through `stopping`,",
    "  which reads the code's end from this catalog. The monitor retries `failed` checks only when",
    "  the code is retryable. `captcha→skipSolver` drops that solver for the rest of the run.",
    "",
    "Print it from the CLI with `log errors`, one code with `log errors --code <code>`, and a machine",
    "with `log graph publish` / `log graph monitor`.",
    "",
  ];
  for (const [name, machine] of Object.entries(MACHINES)) {
    lines.push(`## ${name} machine`, "", "```mermaid", toMermaid(machine), "```", "");
  }
  for (const layer of LAYERS) {
    lines.push(`## ${layer}`, "", "| Code | Retry | Raised in | Ends in | Meaning | Do |", "| --- | --- | --- | --- | --- | --- |");
    for (const [code, entry] of catalogEntries(layer)) {
      lines.push(
        `| \`${code}\` | ${entry.retryable ? "yes" : "no"} | ${entry.raisedIn.map((r) => `\`${r}\``).join(", ")} | ${endsText(entry)} | ${cell(entry.meaning)} | ${cell(entry.action)} |`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}
