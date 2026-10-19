import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import type { ProfileSessionConfig } from "../../camofox/session/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

/** A profile session that answers from a script: no python, no browser. */
function scriptedProfile(kind = "loggedIn") {
  const steps: string[] = [];
  const configs: ProfileSessionConfig[] = [];
  let closed = 0;
  const factory = (config: ProfileSessionConfig) => {
    configs.push(config);
    return {
      async call<T>(step: string, params: Record<string, unknown> = {}): Promise<T> {
        steps.push(params.path ? `${step} ${String(params.path).split(/[\\/]/).pop()}` : step);
        if (step === "read") return { ok: true, kind, path: "/profile.php", profileControl: "Update profile picture", coverControl: "Add cover photo", fileInputs: 0, controls: 88 } as T;
        return { ok: true } as T;
      },
      async close() {
        closed++;
      },
    };
  };
  return { factory, steps, configs, closed: () => closed };
}

async function run(argv: string[], session = scriptedProfile(), twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { profileSession: session.factory, twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), session, twenty };
}

describe("log profile setup", () => {
  test("a dry run reads the profile through the gates and changes nothing", async () => {
    const result = await run(["profile", "setup", "--account", "galwayOne"]);
    expect(result.code).toBe(0);
    expect(result.session.steps).toEqual(["open", "read"]);
    expect(result.session.closed()).toBe(1);
    expect(result.out).toContain("dry run: nothing changed on Facebook");
    expect(result.out).toContain("Profile photo: no photo set in Twenty");
    expect(result.out).toContain("profileFound.txt");
    // Every state is printed live (rules 6, 26), and the run records its HAR folder (rule 22).
    expect(result.err).toContain("reading");
    expect(result.session.configs[0].captureDir.replaceAll("\\", "/")).toMatch(/\/profile\/\d{8}T\d{6}_galwayOne\/firefox$/);
  });

  test("--live with no photos in Twenty is refused before a browser opens", async () => {
    const result = await run(["profile", "setup", "--account", "galwayOne", "--live"]);
    expect(result.code).toBe(1);
    expect(result.session.steps).toEqual([]);
    expect(result.out).toContain("profilePhotoMissing");
  });

  test("--live uploads both photos in one run and records profileSetAt", async () => {
    const dir = mkdtempSync(join(tmpdir(), "logProfile"));
    const face = join(dir, "face.png");
    const cover = join(dir, "cover.png");
    writeFileSync(face, await sharp({ create: { width: 400, height: 400, channels: 3, background: "#8a6" } }).png().toBuffer());
    writeFileSync(cover, await sharp({ create: { width: 820, height: 312, channels: 3, background: "#468" } }).png().toBuffer());
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "galwayOne", { profilePhoto: face, coverPhoto: cover } as never);
    const result = await run(["profile", "setup", "--account", "galwayOne", "--live"], scriptedProfile(), twenty);
    expect(result.code).toBe(0);
    expect(result.session.steps).toEqual(["open", "read", "uploadProfilePhoto photo1.jpg", "uploadCoverPhoto photo2.jpg"]);
    expect(result.out).toContain("Profile photo: uploaded");
    expect(result.out).toContain("Cover photo: uploaded");
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.profileSetAt).toBeTruthy();
  });

  test("not signed in: stops and says to connect first", async () => {
    const result = await run(["profile", "setup", "--account", "galwayOne"], scriptedProfile("loginForm"));
    expect(result.code).toBe(1);
    expect(result.out).toContain("sessionExpired");
  });

  test("needs the setup subcommand", async () => {
    const result = await run(["profile", "--account", "galwayOne"]);
    expect(result.code).toBe(1);
    expect(result.err).toContain('expected "setup"');
  });
});
