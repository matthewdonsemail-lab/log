import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createActor, toPromise } from "xstate";
import type { StepExchange } from "../../subq/stepReading/types.ts";
import type { CommandContext } from "../runner/types.ts";
import { hostActors } from "./helpers/index.ts";
import type { HostBrowser } from "./helpers/index.ts";

const BETHLEHEM = { accountName: "61594063207669", homeCity: "Bethlehem", homeCountry: "US" } as never;

function createPage(canPost: boolean): StepExchange {
  return {
    offsetMs: 0, kind: "document", name: "page /marketplace/create/item", method: "GET", host: "www.facebook.com", path: "/marketplace/create/item", status: 200, ms: 7750, sent: null,
    answer: { title: "Create new listing | Facebook", bytes: 1, fields: { sell_location: { reverse_geocode_detailed: { city: "Bethlehem", postal_code: "18018-4248", country_alpha_two: "US" } }, marketplace_new_seller_can_post_item: canPost } },
    errors: [], known: true,
  };
}

function hostWith(canPost: boolean) {
  const root = mkdtempSync(join(tmpdir(), "hostAnswers"));
  const sent: { action: string; expect?: { name: string } }[] = [];
  let n = 0;
  const context = {
    err: () => {},
    sendInspect: async (_current: unknown, action: string, args: string[], _ms: number, expect?: { name: string }) => {
      sent.push({ action, expect });
      const folder = join(root, `${String(++n).padStart(2, "0")}_${action}`);
      mkdirSync(folder, { recursive: true });
      const url = action === "goto" ? args[0] : "https://www.facebook.com/marketplace/";
      const exchanges = url.endsWith("/create/item") ? [createPage(canPost)] : url.endsWith("/marketplace/") ? [{ ...createPage(true), name: "page /marketplace/", answer: { fields: { buy_location: { display_name: "Bethlehem, Pennsylvania" } } } }] : [];
      writeFileSync(join(folder, "exchanges.json"), JSON.stringify(exchanges));
      return { ok: true, url, title: "Facebook", folder };
    },
  } as unknown as CommandContext;
  const browser: HostBrowser = { run: null, session: { current: { account: "61594063207669" } } as never };
  return { actors: hostActors(context, BETHLEHEM, browser, { bypassHours: true, log: () => {} }), sent };
}

describe("the host's warm-up decides each step on Facebook's answer (rule 73)", () => {
  test("the create page answering marketplace_new_seller_can_post_item false stops the host as marketplaceMayNotPost", async () => {
    const { actors } = hostWith(false);
    const outcome = await toPromise(createActor(actors.warmupActivity, { input: { activity: "createAccessCheck", live: true } as never }).start());
    expect(outcome).toEqual({ kind: "issue", issue: "marketplaceMayNotPost", detail: "s03_gotomarketplaceCreateItem: page /marketplace/create/item answered fields.marketplace_new_seller_can_post_item = false, not true" });
  });

  test("with the account free to post and its locations at home, the activity is done", async () => {
    const { actors, sent } = hostWith(true);
    const outcome = await toPromise(createActor(actors.warmupActivity, { input: { activity: "createAccessCheck", live: true } as never }).start());
    expect(outcome).toEqual({ kind: "ok" });
    expect(sent.map((s) => s.action)).toEqual(["goto", "dwell", "goto", "dwell", "goto", "scroll"]);
  });
});
