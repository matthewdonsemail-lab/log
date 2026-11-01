import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadUserEnv, parseEnvFile, userEnvPath } from "./index.ts";

describe("userEnv", () => {
  test("reads keys, skips blanks and # lines, and unquotes values", () => {
    expect(parseEnvFile("# setup\n\nLOG_ACCOUNTS=local\nexport LOG_PYTHON=\"C:/Python312/python.exe\"\nNAME='a b'\nnot a line\n")).toEqual({
      LOG_ACCOUNTS: "local",
      LOG_PYTHON: "C:/Python312/python.exe",
      NAME: "a b",
    });
  });

  test("fills only what isn't set, so a project's .env.local still wins", () => {
    const dir = mkdtempSync(join(tmpdir(), "userEnv-"));
    const path = join(dir, ".env");
    writeFileSync(path, "LOG_ACCOUNTS=local\nLOG_PYTHON=python3.12\nEMPTY_ONE=filled\n");
    const env: Record<string, string | undefined> = { LOG_PYTHON: "C:/Python312/python.exe", EMPTY_ONE: "" };
    expect(loadUserEnv(env, path).sort()).toEqual(["EMPTY_ONE", "LOG_ACCOUNTS"]);
    expect(env).toEqual({ LOG_PYTHON: "C:/Python312/python.exe", LOG_ACCOUNTS: "local", EMPTY_ONE: "filled" });
  });

  test("no file is no change", () => {
    const env: Record<string, string | undefined> = {};
    expect(loadUserEnv(env, join(tmpdir(), "missing-userEnv", ".env"))).toEqual([]);
    expect(env).toEqual({});
  });

  test("LOG_USER_ENV moves the file, otherwise it is ~/.logCli/.env", () => {
    expect(userEnvPath({ LOG_USER_ENV: "/tmp/x.env" })).toBe("/tmp/x.env");
    expect(userEnvPath({}).replace(/\\/g, "/")).toMatch(/\/\.logCli\/\.env$/);
  });
});
