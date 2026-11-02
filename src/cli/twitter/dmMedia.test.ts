import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { localMedia, sendDmParts } from "./helpers/send.ts";
import type { TwitterEngineSpec } from "../../twitter/account/session/index.ts";

describe("a dm can carry a meme (rule 119)", () => {
  test("an https link is downloaded to a local file first; a path stays as it is", async () => {
    const fetcher = (async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 })) as unknown as typeof fetch;
    const [file, kept] = (await localMedia(["https://cdn.example/assets/abc/main.webp", "local.png"], fetcher))!;
    expect(file!.endsWith("abc_main.webp")).toBe(true);
    expect(existsSync(file!) && readFileSync(file!).length).toBe(3);
    expect(kept).toBe("local.png");
  });

  test("a failed download is refused with mediaInvalid", async () => {
    const fetcher = (async () => new Response("", { status: 404 })) as unknown as typeof fetch;
    await expect(localMedia(["https://cdn.example/x.webp"], fetcher)).rejects.toMatchObject({ code: "mediaInvalid" });
  });

  test("the file goes on the first message of a split dm only", async () => {
    const specs: TwitterEngineSpec[] = [];
    const engine = async (spec: TwitterEngineSpec) => {
      specs.push(spec);
      return { answer: { ok: true, event: "sent", loginState: "loggedIn" as const }, refreshed: null };
    };
    await sendDmParts({ err: () => {}, sleep: async () => {} }, engine as never, { action: "dm", userId: "42", media: ["meme.webp"], live: true } as TwitterEngineSpec, { parts: ["haha", "when you dropping it"], gapSeconds: 1, why: "two lines" } as never);
    expect(specs.map((s) => s.media)).toEqual([["meme.webp"], undefined]);
  });
});
