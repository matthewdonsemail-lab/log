import { afterEach, describe, expect, test } from "bun:test";
import { createMemelordClient } from "../../extensions/memelord/index.ts";
import type { MemelordFetch } from "../../extensions/memelord/index.ts";
import { runCli } from "../runner/index.ts";
import { memelordDeps } from "./index.ts";

const original = memelordDeps.client;
afterEach(() => {
  memelordDeps.client = original;
});

function withAnswers(answers: Record<string, unknown>) {
  const urls: string[] = [];
  const fetcher: MemelordFetch = async (url) => {
    urls.push(url);
    const key = Object.keys(answers).find((k) => url.includes(k)) ?? "";
    return { status: 200, json: async () => answers[key] ?? {} };
  };
  memelordDeps.client = () => createMemelordClient("mlord_live_test", fetcher);
  return urls;
}

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log memelord", () => {
  test("search prints each template with its media url", async () => {
    const urls = withAnswers({ "/templates/search": { results: [{ id: "abc", name: "The horrors persist", type: "meme", url: "https://cdn.example/abc/main.webp", text_slot_count: 2 }] } });
    const r = await run(["memelord", "search", "deploy", "on", "friday", "--type", "meme", "--limit", "1"]);
    expect(r.code).toBe(0);
    expect(urls[0]).toContain("query=deploy+on+friday");
    expect(r.out).toContain("The horrors persist (meme, 2 text slots)");
    expect(r.out).toContain("https://cdn.example/abc/main.webp");
  });

  test("tools lists the catalog with camelCase categories turned into Memelord's own values", async () => {
    const urls = withAnswers({ "/image-tools": { count: 1, tools: [{ tool_id: "wojak", name: "Wojakifier", category: "image-to-image", description: "Turn a photo into a Wojak" }] } });
    const r = await run(["memelord", "tools", "--category", "imageToImage"]);
    expect(urls[0]).toContain("category=image-to-image");
    expect(r.out).toContain("log never runs them");
    expect(r.out).toContain("Wojakifier");
  });

  test("a bad limit is refused before any call", async () => {
    const urls = withAnswers({});
    const r = await run(["memelord", "trending", "--limit", "40"]);
    expect(r.code).toBe(1);
    expect(urls).toEqual([]);
  });
});
