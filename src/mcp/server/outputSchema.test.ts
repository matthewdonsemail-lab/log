import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { AjvJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/ajv";
import type { JsonSchemaType } from "@modelcontextprotocol/sdk/validation";
import { openDatabase } from "../../storage/schema/index.ts";
import { buildGraph } from "../../relate/graph/index.ts";
import { MACHINE_NOW, seedMachineWorld } from "../../relate/machine/fixtures/machineWorld.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "../apps/browserView/index.ts";
import { CARDS } from "../apps/cards.ts";
import { MACHINE_TOOL, REPORT_TOOL } from "../apps/report/index.ts";
import { createLogMcpServer, TOOL_RESULT_SCHEMA } from "./index.ts";
import { LOADS_EVERY_TOOL_MS } from "../../../scripts/tests/timeouts.ts";

const HERMES = ["hermes", "agent"].join("-");
const UI = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };

const SAMPLES: Record<string, { args: Record<string, unknown>; ok: boolean }[]> = {
  [MACHINE_TOOL]: [
    { args: { person: "ivy_ops" }, ok: true },
    { args: { person: "discord:grace_ships", view: "person" }, ok: true },
    { args: { view: "network" }, ok: true },
    { args: { person: "nobody_here_at_all" }, ok: false },
    { args: { view: "sideways" }, ok: false },
  ],
  [REPORT_TOOL]: [
    { args: { title: "Fake numbers", blocks: [{ type: "stat", items: [{ label: "Messages in", value: 3 }] }] }, ok: true },
    { args: { title: "Fake numbers", blocks: [{ type: "nothing" }] }, ok: false },
  ],
};

const scratch = mkdtempSync(join(tmpdir(), "logOutputSchema"));
const dbPath = join(scratch, "log.db");
const before = process.env.LOG_DB;

beforeAll(() => {
  seedMachineWorld(openDatabase(dbPath));
  buildGraph(dbPath, new Date(MACHINE_NOW));
  process.env.LOG_DB = dbPath;
});

afterAll(() => {
  if (before === undefined) delete process.env.LOG_DB;
  else process.env.LOG_DB = before;
  openDatabase(dbPath).close();
  Bun.gc(true);
  rmSync(scratch, { recursive: true, force: true });
});

async function connected(name: string, capabilities: Record<string, unknown>) {
  const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
  const client = new Client({ name, version: "0.0.0" }, { capabilities });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

const validator = new AjvJsonSchemaValidator();

describe("every view tool's structuredContent matches the outputSchema it lists", () => {
  test("each view card tool drawn from log.db has samples here", () => {
    const viewTools = CARDS.filter((card) => card.uiOnly).flatMap((card) => card.tools);
    expect(viewTools.length).toBeGreaterThan(0);
    for (const tool of viewTools) expect(Object.keys(SAMPLES)).toContain(tool);
  });

  for (const [host, capabilities] of [[HERMES, {}], ["viewHost", UI], ["textHost", {}]] as const)
    test(`${host}: the listed schema validates every answer, refusals included`, async () => {
      const client = await connected(host, capabilities);
      const listed = new Map((await client.listTools()).tools.map((tool) => [tool.name, tool]));
      for (const [name, samples] of Object.entries(SAMPLES)) {
        const tool = listed.get(name);
        expect(tool?.outputSchema).toBeDefined();
        const check = validator.getValidator(tool!.outputSchema as JsonSchemaType);
        for (const sample of samples) {
          const result = await client.callTool({ name, arguments: sample.args });
          expect(Boolean(result.isError)).toBe(!sample.ok);
          if (result.structuredContent === undefined) {
            expect(result.isError).toBe(true);
            continue;
          }
          const verdict = check(result.structuredContent);
          expect({ name, args: sample.args, error: verdict.errorMessage ?? null }).toEqual({ name, args: sample.args, error: null });
        }
      }
    }, LOADS_EVERY_TOOL_MS);

  test("relateMachine answers with the result envelope and its view together", async () => {
    const client = await connected(HERMES, {});
    await client.listTools();
    const result = await client.callTool({ name: MACHINE_TOOL, arguments: { person: "ivy_ops", view: "person" } });
    const structured = result.structuredContent as Record<string, unknown>;
    for (const field of TOOL_RESULT_SCHEMA.required) expect(Object.keys(structured)).toContain(field);
    expect(structured).toMatchObject({ exit: 0, ok: true, code: null, capability: "relate.machine" });
    expect(typeof structured.title).toBe("string");
    const refused = await client.callTool({ name: MACHINE_TOOL, arguments: { person: "nobody_here_at_all" } });
    expect(refused.structuredContent).toMatchObject({ exit: 1, ok: false, code: "relateMachineNobody", capability: "relate.machine" });
  }, LOADS_EVERY_TOOL_MS);
});
