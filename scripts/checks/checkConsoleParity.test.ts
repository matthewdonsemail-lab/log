import { describe, expect, test } from "bun:test";
import { COMMANDS } from "../../src/cli/runner/index.ts";
import { CONSOLE_OPERATIONS, CONSOLE_TWINS, RUNTIME_TWINS } from "../../src/console/operations/index.ts";
import { appTools } from "../../src/mcp/apps/browserView/index.ts";
import { commandToolNames, consoleTwinProblems } from "./checkConsoleParity.ts";

const tools = commandToolNames(COMMANDS);
const apps = new Set(appTools().map((tool) => tool.name));

describe("every console operation has a command twin", () => {
  test("CONSOLE_TWINS and RUNTIME_TWINS name commands that exist, and every operation has one", () => {
    expect(consoleTwinProblems(CONSOLE_OPERATIONS, CONSOLE_TWINS, tools, apps)).toEqual([]);
    expect(consoleTwinProblems(Object.keys(RUNTIME_TWINS), RUNTIME_TWINS, tools, apps, "RUNTIME_TWINS")).toEqual([]);
  });

  test("the slice's twins are commands: credentials, the password save and accountsList", () => {
    expect(CONSOLE_TWINS.credentialsSave.commands).toEqual(["credentialsSave"]);
    expect(CONSOLE_TWINS.credentialsRead.commands).toEqual(["credentialsRead"]);
    expect(CONSOLE_TWINS.accountSignIn.commands).toContain("localAccountLogin");
    expect(tools.get("credentialsSave")).toEqual({ terminalOnly: true });
    expect(tools.get("localAccountLogin")).toEqual({ terminalOnly: true });
    expect(tools.get("credentialsRead")).toEqual({ terminalOnly: false });
    expect(tools.get("accountsList")).toEqual({ terminalOnly: false });
  });

  test("an operation with no twin, an empty twin, an unknown command and a stale entry each fail", () => {
    const problems = consoleTwinProblems(["usage", "events", "credentialsSave", "browserFrame"], { usage: { commands: ["consoleUsage"] }, events: { commands: [] }, credentialsSave: { commands: ["credentialsStore"] }, browserFrame: { commands: [], app: ["browserViewPixels"] }, gone: { commands: ["consoleUsage"] } }, tools, apps);
    expect(problems).toEqual([
      "events has no twin in CONSOLE_TWINS (src/console/operations/types.ts): make it a command, or name the command it calls, so the CLI and the MCP reach it too",
      "CONSOLE_TWINS.credentialsSave names credentialsStore, which no command form in COMMANDS is",
      "CONSOLE_TWINS.browserFrame names browserViewPixels, which no MCP App tool is",
      "CONSOLE_TWINS has gone, which is not an operation",
    ]);
    expect(consoleTwinProblems(["accountsList"], {}, tools, apps, "RUNTIME_TWINS")[0]).toContain("accountsList has no twin in RUNTIME_TWINS");
  });
});
