import { describe, expect, test } from "bun:test";
import { syncProfiles } from "../../browser/adsPower/index.ts";
import type { AdsPowerClient, AdsPowerProfile } from "../../browser/adsPower/index.ts";
import { listFacebookAccounts } from "../../marketplace/socialAccount/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

function memoryAdsPower(limit: number) {
  const profiles: AdsPowerProfile[] = [];
  const deleted: string[] = [];
  let next = 0;
  const client: AdsPowerClient = {
    status: async () => true,
    listProfiles: async () => [...profiles],
    ensureGroup: async () => "7",
    createProfile: async (body) => {
      if (profiles.length >= limit) throw new Error(`the limit of ${limit}`);
      const profileId = `p${++next}`;
      profiles.push({ profileId, profileNo: null, name: body.name, groupId: body.group_id, remark: body.remark ?? null, lastOpenTime: null });
      return { profileId, profileNo: null };
    },
    updateProfile: async () => {},
    deleteProfiles: async (ids) => {
      for (const id of ids) profiles.splice(profiles.findIndex((p) => p.profileId === id), 1);
      deleted.push(...ids);
    },
    startBrowser: async (id) => ({ profileId: id, cdpUrl: "ws://x", debugPort: null }),
    activeBrowser: async () => null,
    stopBrowser: async () => {},
    kernels: async () => [{ version: "156", downloaded: true }],
    downloadKernel: async () => ({ status: "completed", progress: null }),
    profileUserAgents: async (ids) => Object.fromEntries(ids.map((id) => [id, "Mozilla/5.0 Chrome/156.0.8078.47 Safari/537.36"])),
  };
  return { client, profiles, deleted };
}

describe("log facebook account status DEACTIVATED gives the AdsPower profile back (rule 78)", () => {
  test("the deactivated account's profile is deleted and unlinked, and an account waiting for one takes the slot", async () => {
    const twenty = marketplaceFixture();
    const ads = memoryAdsPower(3);
    await syncProfiles(twenty, ads.client, { apply: true, homes: null });
    const before = await listFacebookAccounts(twenty);
    const holder = before.find((a) => a.adsPowerProfileId)!;
    const waiting = before.filter((a) => !a.adsPowerProfileId).length;
    const out: string[] = [];
    const code = await runCli(["facebook", "account", "status", holder.accountName, "DEACTIVATED"], { twenty, adsPower: ads.client, out: (l) => out.push(l), err: () => {} });
    expect(code).toBe(0);
    expect(ads.deleted).toEqual([holder.adsPowerProfileId!]);
    const after = await listFacebookAccounts(twenty);
    expect(after.find((a) => a.id === holder.id)!.adsPowerProfileId).toBeNull();
    expect(ads.profiles).toHaveLength(3);
    expect(out.join("\n")).toContain(`AdsPower: released ${holder.accountName}'s profile ${holder.adsPowerProfileId} (status deactivated).`);
    expect(out.join("\n")).toMatch(/AdsPower: \S+ took the freed slot, profile p4\./);
    expect(after.filter((a) => !a.adsPowerProfileId).length).toBe(waiting);
  });
});
