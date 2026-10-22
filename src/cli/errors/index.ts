import { ERROR_CATALOG, isErrorCode } from "../../errors/catalog/index.ts";
import type { ErrorLayer } from "../../errors/catalog/index.ts";
import { toMermaid } from "../../observability/graph/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { LAYERS, MACHINES, catalogEntries, renderCatalogEntry, renderCatalogMarkdown, renderCatalogTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const ERRORS_USAGE = `Usage: log errors [--layer <${LAYERS.join("|")}>] [--code <code>] [--json] [--markdown]`;
export const GRAPH_USAGE = `Usage: log graph <${Object.keys(MACHINES).join("|")}>`;

export const ERRORS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "The error catalog",
      positionals: [],
      flags: [
        { name: "layer", kind: "enum", values: LAYERS, description: "Only this layer's codes" },
        { name: "code", kind: "string", description: "One code in full" },
        JSON_FLAG,
        { name: "markdown", kind: "boolean", description: "As Markdown" },
      ],
    },
  ],
};

export const errorsCommand: Command = {
  usage: ERRORS_USAGE,
  platform: "any",
  name: "errors",
  input: ERRORS_INPUT,
  summary: "List every error code: meaning, retryable, where each machine ends up",
  args: "[--layer <layer>] [--code <code>] [--json] [--markdown]",
  run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(ERRORS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log errors: ${parsed.error}\n${ERRORS_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log errors: unexpected argument "${parsed.positionals[0]}"\n${ERRORS_USAGE}` };

    const code = parsed.flags["code"];
    if (typeof code === "string") {
      if (!isErrorCode(code)) return { code: 1, stderr: `log errors: "${code}" is not in the catalog\n${ERRORS_USAGE}` };
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ code, ...ERROR_CATALOG[code] }, null, 2) };
      return { code: 0, stdout: renderCatalogEntry(code) };
    }

    const layer = parsed.flags["layer"];
    if (layer !== undefined && !(LAYERS as unknown[]).includes(layer)) {
      return { code: 1, stderr: `log errors: unknown layer "${String(layer)}"\n${ERRORS_USAGE}` };
    }
    if (parsed.flags["markdown"]) return { code: 0, stdout: renderCatalogMarkdown() };
    if (parsed.flags["json"]) {
      const entries = Object.fromEntries(catalogEntries(layer as ErrorLayer | undefined));
      return { code: 0, stdout: JSON.stringify(entries, null, 2) };
    }
    return { code: 0, stdout: renderCatalogTable(layer as ErrorLayer | undefined) };
  },
};

export const graphCommand: Command = {
  usage: GRAPH_USAGE,
  platform: "any",
  name: "graph",
  summary: "Print a machine's states and transitions as a Mermaid diagram",
  args: `<${Object.keys(MACHINES).join("|")}>`,
  run(_context, argv) {
    const parsed = parseArgs(argv, {});
    if (!parsed.ok) return { code: 1, stderr: `log graph: ${parsed.error}\n${GRAPH_USAGE}` };
    const [name, extra] = parsed.positionals;
    if (name === undefined || extra !== undefined || !Object.hasOwn(MACHINES, name)) {
      return { code: 1, stderr: `log graph: pick one machine\n${GRAPH_USAGE}` };
    }
    return { code: 0, stdout: toMermaid(MACHINES[name as keyof typeof MACHINES]) };
  },
};
