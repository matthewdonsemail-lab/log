import { describe, expect, test } from "bun:test";
import { discordSecretsCommand, discordSecretsDeps, totpSecretOf } from "./index.ts";

const account = { id: "acct1", accountName: "deepman2", platform: "DISCORD", status: "ACTIVE" };

function contextWith(saved: Record<string, unknown>[]) {
  return {
    twenty: {
      list: async () => [account],
      find: async () => [account],
      findOne: async () => account,
      loginSecrets: async () => ({ email: "accountEmail", password: null, totpSecret: null, messengerPin: null }),
      update: async (_object: string, _id: string, fields: Record<string, unknown>) => {
        saved.push(fields);
      },
    },
    err: () => {},
  } as never;
}

describe("log discord secrets", () => {
  test("a 2FA secret is base32, spaces and dashes dropped", () => {
    expect(totpSecretOf("abcd efgh ijkl mnop")).toBe("ABCDEFGHIJKLMNOP");
    expect(totpSecretOf("not a key 1890")).toBeNull();
  });

  test("refuses to prompt without a terminal and saves nothing", async () => {
    const saved: Record<string, unknown>[] = [];
    const tty = discordSecretsDeps.tty;
    discordSecretsDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    try {
      const out = await discordSecretsCommand.run(contextWith(saved), ["--account", "deepman2"]);
      expect(out.code).toBe(1);
      expect(saved).toEqual([]);
    } finally {
      discordSecretsDeps.tty = tty;
    }
  });
});
