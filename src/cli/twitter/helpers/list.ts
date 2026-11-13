import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

const ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle) whose lists these are" };
const APPROVED_BY: FlagSpec = { name: "approvedBy", kind: "string", approval: true, description: "Who approved it: needed with --live (rule 8)" };
const LIVE: FlagSpec = { name: "live", kind: "boolean", live: true, description: "Make the change on X, only when the owner asked (rule 8); without it a dry run contacts nothing" };

export const LIST_USAGE = [
  "Usage: log twitter list show --account <accountName> [--json]",
  "       log twitter list create --account <accountName> --name <name> [--description <text>] [--private] [--approvedBy <who>] [--live] [--json]",
  "       log twitter list add --account <accountName> --list <name|id> --handle <handle>|--userId <id> [--approvedBy <who>] [--live] [--json]",
  "X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).",
].join("\n");

export const LIST_INPUT: CommandInput = {
  forms: [
    { words: ["show"], effect: "read", summary: "List the X account's lists with their ids and member counts, sending nothing", positionals: [], flags: [ACCOUNT, JSON_FLAG] },
    {
      words: ["create"],
      effect: "write",
      summary: "Make an X list on the account; a dry run unless --live",
      positionals: [],
      flags: [ACCOUNT, { name: "name", kind: "string", required: true, description: "The list's name, as the owner gave it" }, { name: "description", kind: "string", description: "The list's description" }, { name: "private", kind: "boolean", description: "Make the list private (default public)" }, APPROVED_BY, LIVE, JSON_FLAG],
    },
    {
      words: ["add"],
      effect: "write",
      summary: "Put one person on one of the account's X lists; a dry run unless --live",
      positionals: [],
      flags: [ACCOUNT, { name: "list", kind: "string", required: true, description: "The list's name or id (log twitter list show)" }, { name: "handle", kind: "string", description: "The person's handle" }, { name: "userId", kind: "string", description: "The person's numeric X user id" }, APPROVED_BY, LIVE, JSON_FLAG],
      groups: [{ rule: "atLeastOne", names: ["handle", "userId"], refusal: "listInvalid" }],
    },
  ],
};

interface ListRow {
  id: string;
  name: string;
  mode: string;
  memberCount: number;
  description: string;
}

export const listCommand: Command = {
  usage: LIST_USAGE,
  platform: "twitter",
  name: "list",
  effect: "write",
  input: LIST_INPUT,
  summary: "The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live",
  args: "show --account <a> | create --account <a> --name <name> [--private] | add --account <a> --list <name|id> --handle <h>|--userId <id>  [--approvedBy <who>] [--live] [--json]",
  async run(context, argv) {
    const word = argv[0];
    const form = LIST_INPUT.forms.find((f) => f.words[0] === word);
    if (!form) return { code: 1, stderr: `log twitter list: show, create or add\n${LIST_USAGE}` };
    const label = `twitter list ${word}`;
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log ${label}: ${parsed.error}\n${LIST_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log ${label}: takes no words after ${word}, only flags\n${LIST_USAGE}` };
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : "");
    const live = parsed.flags["live"] === true;
    const approvedBy = str("approvedBy");
    if (live && !approvedBy) return refuse(label, "notApproved", "--live needs --approvedBy <who> (rule 8)");
    if (word === "add" && !str("handle") && !str("userId")) return refuse(label, "listInvalid", "add needs --handle or --userId");
    try {
      const opened = await openTwitterAccount(context, label, str("account"));
      if (!opened.ok) return opened.result;
      const { account, engine } = opened;
      const shown = await engine({ action: "lists" });
      if (!shown.answer.ok) return { code: 1, stdout: `log ${label}: ${account.accountName}: ${shown.answer.code}: ${shown.answer.detail ?? ""}` };
      const lists = ((shown.answer as unknown as Record<string, unknown>).lists as ListRow[] | undefined) ?? [];
      if (word === "show") {
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, lists }, null, 2) };
        return { code: 0, stdout: [`log twitter list show: @${account.accountName} has ${lists.length} list(s)`, ...lists.map((l) => `  ${l.id}  ${l.name} · ${l.mode} · ${l.memberCount} member(s)${l.description ? ` · ${l.description}` : ""}`)].join("\n") };
      }
      if (word === "create") {
        const name = str("name");
        const already = lists.find((l) => l.name.toLowerCase() === name.toLowerCase());
        if (!live) return { code: 0, stdout: already ? `log ${label}: dry run: @${account.accountName} already has the list "${already.name}" (${already.id}); nothing would be made.` : `log ${label}: dry run: @${account.accountName} would make the ${parsed.flags["private"] ? "private" : "public"} list "${name}". Nothing was contacted. --live --approvedBy <who> makes it (rule 8).` };
        const run = await engine({ action: "listCreate", name, ...(str("description") ? { description: str("description") } : {}), private: parsed.flags["private"] === true, live: true, approvedBy });
        const made = (run.answer as unknown as Record<string, unknown>).list as ListRow | undefined;
        const code = run.answer.ok ? 0 : 1;
        if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
        const governor = governorLine(run);
        return { code, stdout: [run.answer.ok ? `log ${label}: @${account.accountName} ${run.answer.already ? "already had" : "made"} the list "${made?.name}" (${made?.id}).` : `log ${label}: @${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}. Nothing is retried (rule 94).`, ...(governor ? [governor] : [])].join("\n") };
      }
      const said = str("list");
      const target = lists.find((l) => l.id === said) ?? lists.find((l) => l.name.toLowerCase() === said.toLowerCase());
      if (!target) return refuse(label, "listInvalid", `@${account.accountName} has no list "${said}": ${lists.map((l) => l.name).join(", ") || "none yet"}`);
      const who = str("handle") ? `@${str("handle").replace(/^@/, "")}` : str("userId");
      if (!live) return { code: 0, stdout: `log ${label}: dry run: @${account.accountName} would put ${who} on "${target.name}" (${target.id}). Nothing was contacted. --live --approvedBy <who> adds them (rule 8).` };
      const run = await engine({ action: "listAdd", listId: target.id, ...(str("userId") ? { userId: str("userId") } : { screenName: str("handle").replace(/^@/, "") }), live: true, approvedBy });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      const governor = governorLine(run);
      return { code, stdout: [run.answer.ok ? `log ${label}: @${account.accountName} put ${who} on "${target.name}".` : `log ${label}: @${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}. Nothing is retried (rule 94).`, ...(governor ? [governor] : [])].join("\n") };
    } catch (error) {
      return refuseError(label, error);
    }
  },
};
