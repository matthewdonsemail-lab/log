import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COMMANDS, runCli } from "../runner/index.ts";
import { commandTools, currentToolName, RENAMED_SHARED_TOOLS } from "../../mcp/server/index.ts";
import { captureCommand, runCapture } from "./index.ts";

describe("capture is shared", () => {
  test("it takes no platform and is one tool per form", () => {
    expect(captureCommand.platform).toBe("any");
    const tools = commandTools(COMMANDS).filter((t) => t.command.name === "capture").map((t) => t.tool);
    expect(tools.sort()).toEqual(["captureDocs", "captureHar", "captureSettle"]);
    expect(commandTools(COMMANDS).some((t) => t.tool === "facebookCapture")).toBe(false);
  });

  test("the old names run captureDocs for one release", () => {
    expect(RENAMED_SHARED_TOOLS).toEqual({ capture: "captureDocs", facebookCapture: "captureDocs" });
    expect(currentToolName("facebookCapture")).toBe("captureDocs");
    expect(currentToolName("capture")).toBe("captureDocs");
  });

  test("log facebook capture is refused with the shared form", async () => {
    const err: string[] = [];
    const code = await runCli(["facebook", "capture", "docs"], { out: () => {}, err: (line) => err.push(line) });
    expect(code).not.toBe(0);
    expect(err.join("\n")).toContain("log capture docs");
  });

  test("the old flags are refused with the forms that replaced them", async () => {
    const result = await runCapture(["--docs"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("log capture docs");
  });

  test("capture settle writes settle.json in the run's capture folder", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sharedNamesSettle"));
    try {
      const result = await runCapture(["settle", dir], async () => ({ code: 0, stdout: "", stderr: "" }));
      expect(result.code).toBe(0);
      expect(JSON.parse(readFileSync(join(dir, "settle.json"), "utf8"))).toMatchObject({ note: null });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
