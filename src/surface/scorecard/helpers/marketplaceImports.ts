import { posix } from "node:path";
import type { SourceText } from "../types.ts";
import { relativeImports } from "./machines.ts";

export const MARKETPLACE_DIR = "src/marketplace/";
export const MARKETPLACE_OWNERS: readonly string[] = ["src/facebook/", MARKETPLACE_DIR];

export function marketplaceImports(files: readonly SourceText[]): string[] {
  return files.flatMap((file) => {
    if (!file.path.startsWith("src/") || MARKETPLACE_OWNERS.some((dir) => file.path.startsWith(dir))) return [];
    const from = posix.dirname(file.path);
    const hits = relativeImports(file.text).filter((spec) => `${posix.join(from, spec)}/`.startsWith(MARKETPLACE_DIR));
    return hits.length ? [file.path] : [];
  });
}
