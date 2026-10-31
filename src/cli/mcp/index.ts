import { listClients, localOwnerUserId, oauthStorePath, revokeClients } from "../../mcp/oauth/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const MCP_USAGE = [
  "Usage: log mcp clients [--json]   (who signed in to this server's MCP over OAuth: each client, when it was last used, its live tokens, and whether this server has an owner)",
  "       log mcp revoke <clientId|all>   (the client's tokens stop working at once; it must sign in through Twenty again)",
].join("\n");

export const MCP_INPUT: CommandInput = {
  forms: [
    { words: ["clients"], summary: "Who signed in to this server's MCP over OAuth", positionals: [], flags: [JSON_FLAG] },
    { words: ["revoke"], effect: "delete", summary: "Revoke a client's tokens, or every client's", positionals: [{ name: "clientId", kind: "string", required: true, description: "The client's id, or all" }], flags: [] },
  ],
};

export const mcpCommand: Command = {
  usage: MCP_USAGE,
  platform: "any",
  name: "mcp",
  effect: "read",
  input: MCP_INPUT,
  summary: "This server's MCP sign-ins over OAuth (through Twenty, the owner only): list the clients, revoke them",
  args: "clients [--json] | revoke <clientId|all>",
  run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(MCP_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log mcp: ${parsed.error}\n${MCP_USAGE}` };
    const [sub, which, ...rest] = parsed.positionals;
    if (rest.length) return { code: 1, stderr: `log mcp: unexpected argument "${rest[0]}"\n${MCP_USAGE}` };
    if (sub === "clients") {
      const clients = listClients();
      const owner = process.env.LOG_MCP_OWNER_USER_ID || localOwnerUserId() ? "set" : "none: run log login on this server (or set LOG_MCP_OWNER_USER_ID)";
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ store: oauthStorePath(), owner, clients }, null, 2) };
      const lines = clients.map((c) => `${c.clientId}  ${c.revoked ? "revoked" : `${c.liveTokens} live token(s)`}  ${c.name}  last used ${c.lastUsedAt ?? "never"}  ${c.redirectUris.join(", ")}`);
      return { code: 0, stdout: [`Owner: ${owner}`, ...(lines.length ? lines : ["No client has signed in yet."])].join("\n") };
    }
    if (sub === "revoke") {
      if (!which) return { code: 1, stderr: `log mcp revoke: name a client id, or all\n${MCP_USAGE}` };
      const revoked = revokeClients(which);
      if (!revoked.length) return { code: 1, stderr: `log mcp revoke: no client ${which}` };
      return { code: 0, stdout: `Revoked ${revoked.length} client(s): ${revoked.join(", ")}. Their tokens stopped working; each must sign in through Twenty again.` };
    }
    return { code: 1, stderr: `log mcp: pick clients or revoke\n${MCP_USAGE}` };
  },
};
