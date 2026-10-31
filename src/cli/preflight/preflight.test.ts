import { describe, expect, test } from "bun:test";
import type { AdsPowerClient, AdsPowerKernel } from "../../browser/adsPower/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { kernelFacts } from "./index.ts";

const ua = (version: number) => `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.8037.98 Safari/537.36`;

function contextWith(kernels: AdsPowerKernel[], agents: Record<string, string>, up = true) {
  const downloads: string[] = [];
  const adsPower = {
    status: async () => up,
    kernels: async () => kernels,
    profileUserAgents: async (ids: string[]) => Object.fromEntries(ids.map((id) => [id, agents[id] ?? ""])),
    downloadKernel: async (version: string) => {
      downloads.push(version);
      kernels.find((k) => k.version === version)!.downloaded = true;
      return { status: "completed", progress: null };
    },
  } as unknown as AdsPowerClient;
  return { context: { adsPower, err: () => {} } as unknown as CommandContext, downloads };
}

describe("preflight reads each profile's kernel from AdsPower", () => {
  const AGENTS = { k1ib8m0k: ua(156), k1ib8m28: ua(154), k1ib8m3j: ua(154), k1ib91gs: ua(155) };

  test("without --apply it only reports: Scranton and Pittston need 154, which isn't there", async () => {
    const { context, downloads } = contextWith([{ version: "154", downloaded: false }, { version: "155", downloaded: true }, { version: "156", downloaded: true }], AGENTS);
    const facts = await kernelFacts(context, Object.keys(AGENTS), false);
    expect(facts.k1ib8m28).toEqual({ reachable: true, version: "154", downloaded: false });
    expect(facts.k1ib8m0k).toEqual({ reachable: true, version: "156", downloaded: true });
    expect(downloads).toEqual([]);
  });

  test("--apply downloads each missing version once, only the ones a profile needs", async () => {
    const { context, downloads } = contextWith([{ version: "153", downloaded: false }, { version: "154", downloaded: false }, { version: "155", downloaded: false }, { version: "156", downloaded: true }], AGENTS);
    const facts = await kernelFacts(context, Object.keys(AGENTS), true);
    expect(downloads).toEqual(["154", "155"]);
    expect(Object.values(facts).every((f) => f.downloaded)).toBe(true);
  });

  test("AdsPower not answering marks every profile unreachable", async () => {
    const { context } = contextWith([], AGENTS, false);
    expect((await kernelFacts(context, ["k1ib8m0k"], false)).k1ib8m0k).toMatchObject({ reachable: false, downloaded: false });
  });
});
