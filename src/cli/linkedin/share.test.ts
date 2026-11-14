import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { activityOf, hasMentions, imageOf } from "./helpers/share.ts";

describe("linkedin post and delete inputs", () => {
  test("activityOf takes an id, an activity urn or a post url", () => {
    expect(activityOf("7526783834110054400")).toBe("7526783834110054400");
    expect(activityOf("urn:li:activity:7526783834110054400")).toBe("7526783834110054400");
    expect(activityOf("https://www.linkedin.com/feed/update/urn:li:activity:7526783834110054400/")).toBe("7526783834110054400");
    expect(activityOf("https://www.linkedin.com/posts/someone_hello-activity-7526783834110054400-abcd")).toBe("7526783834110054400");
    expect(activityOf("hello")).toBeNull();
  });

  test("hasMentions sends every @[ to the engine's mention check", () => {
    expect(hasMentions("thanks @[Testlio] for this")).toBe(true);
    expect(hasMentions("thanks @[Testlio|2803589]")).toBe(true);
    expect(hasMentions("thanks @[Mandeep Singh|ACoAAFakeMember_Id-123]")).toBe(true);
    expect(hasMentions("email me @ home or @testlio")).toBe(false);
    expect(hasMentions("@[]")).toBe(true);
  });

  test("imageOf keeps images under the allowed roots and refuses the rest", () => {
    const root = mkdtempSync(join(tmpdir(), "liOutbox"));
    const other = mkdtempSync(join(tmpdir(), "liElsewhere"));
    writeFileSync(join(root, "a.jpg"), "x");
    writeFileSync(join(root, "a.txt"), "x");
    writeFileSync(join(other, "b.png"), "x");
    expect(imageOf("", [root])).toEqual({ ok: true, path: null });
    expect(imageOf(join(root, "a.jpg"), [root])).toEqual({ ok: true, path: join(root, "a.jpg") });
    expect(imageOf(join(root, "a.txt"), [root]).ok).toBe(false);
    expect(imageOf(join(root, "missing.jpg"), [root]).ok).toBe(false);
    expect(imageOf(join(other, "b.png"), [root]).ok).toBe(false);
  });
});
