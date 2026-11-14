import { describe, expect, test } from "bun:test";
import { filesIn, marketplaceImports, REPO_ROOT } from "./index.ts";

const file = (path: string, text: string) => ({ path, text });
const importing = (spec: string) => `import { a } from "${spec}";`;

describe("marketplaceImports", () => {
  test("counts a file outside src/facebook/ and src/marketplace/ that imports src/marketplace/", () => {
    expect(
      marketplaceImports([
        file("src/cli/fakeCommand/index.ts", importing("../../marketplace/listing/index.ts")),
        file("src/platformKit/fakeKit/client.ts", importing("../../facebook/marketplace/listing/index")),
        file("src/facebook/fakeArea/client.ts", importing("../../marketplace/listing/index.ts")),
        file("src/marketplace/fakeDomain/client.ts", importing("../listing/index.ts")),
        file("scripts/fakeScript.ts", importing("../src/marketplace/listing/index.ts")),
        file("src/browser/fakeRun/client.ts", 'const page = "https://www.facebook.com/marketplace/";'),
      ]),
    ).toEqual(["src/cli/fakeCommand/index.ts"]);
  });

  test("shared code no longer imports src/marketplace/", () => {
    expect(marketplaceImports(filesIn(REPO_ROOT, "src", [".ts", ".tsx", ".mjs", ".js"]))).toEqual([]);
  });
});
