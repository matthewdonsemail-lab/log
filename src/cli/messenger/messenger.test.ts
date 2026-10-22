import { afterEach, describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { isMessengerPin, messengerDeps } from "./index.ts";

const real = { prompts: messengerDeps.prompts, tty: messengerDeps.tty };
afterEach(() => Object.assign(messengerDeps, real));

function prompted(answers: string[]) {
  const said: string[] = [];
  messengerDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  messengerDeps.prompts = {
    intro: (t) => said.push(`intro ${t}`),
    outro: (m) => said.push(`outro ${m}`),
    cancel: (m) => said.push(`cancel ${m}`),
    password: async () => answers.shift(),
  };
  return said;
}

async function run(argv: string[], twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), twenty };
}

describe("log facebook messenger pin", () => {
  test("a PIN is six digits", () => {
    expect(isMessengerPin("123456")).toBe(true);
    expect(isMessengerPin("12345")).toBe(false);
    expect(isMessengerPin("12a456")).toBe(false);
  });

  test("the PIN typed twice is kept in Twenty and never printed", async () => {
    prompted(["482913", "482913"]);
    const r = await run(["facebook", "messenger", "pin", "--account", "galwayOne"]);
    expect(r.code).toBe(0);
    expect(r.out + r.err).not.toContain("482913");
    const account = (await r.twenty.list("socialAccounts")).find((a) => a.accountName === "galwayOne")!;
    expect((await r.twenty.loginSecrets(account.id))?.messengerPin).toBe("482913");
    const shown = await run(["facebook", "messenger", "pin", "--account", "galwayOne", "--show"], r.twenty);
    expect(shown.out).toContain("<set>");
    expect(shown.out).not.toContain("482913");
  });

  test("two different PINs save nothing", async () => {
    prompted(["482913", "111111"]);
    const r = await run(["facebook", "messenger", "pin", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    const account = (await r.twenty.list("socialAccounts")).find((a) => a.accountName === "galwayOne")!;
    expect((await r.twenty.loginSecrets(account.id))?.messengerPin).toBeNull();
  });

  test("without a terminal it asks for one and never takes the PIN as a flag", async () => {
    messengerDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    const r = await run(["facebook", "messenger", "pin", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("interactive terminal");
  });
});
