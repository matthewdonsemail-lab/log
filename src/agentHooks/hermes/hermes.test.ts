import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { hermesHome } from "./client.ts";

const HOME = join("/home", "owner");
const LOCAL = join("/local", "AppData");

describe("hermesHome", () => {
  it("takes LOG_HERMES_DIR first", () => {
    expect(hermesHome({ LOG_HERMES_DIR: "/a", HERMES_HOME: "/b" }, HOME, () => false)).toBe("/a");
  });

  it("takes HERMES_HOME, the folder Hermes itself reads", () => {
    expect(hermesHome({ HERMES_HOME: "/b" }, HOME, () => false)).toBe("/b");
  });

  it("keeps ~/.hermes when it exists", () => {
    const dot = join(HOME, ".hermes");
    expect(hermesHome({ LOCALAPPDATA: LOCAL }, HOME, (path) => path === dot)).toBe(dot);
  });

  it("finds Hermes's Windows home under LOCALAPPDATA", () => {
    const windows = join(LOCAL, "hermes");
    expect(hermesHome({ LOCALAPPDATA: LOCAL }, HOME, (path) => path === windows)).toBe(windows);
  });

  it("falls back to ~/.hermes when no home exists yet", () => {
    expect(hermesHome({ LOCALAPPDATA: LOCAL }, HOME, () => false)).toBe(join(HOME, ".hermes"));
  });
});
