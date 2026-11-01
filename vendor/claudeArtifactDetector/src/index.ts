/**
 * @claudewatermark/artifact-detector
 *
 * Detects and removes the deterministic artifacts that AI chat interfaces leave
 * in copy-pasted text: Claude's HTML class attributes, provider data-* flags,
 * zero-width characters, exotic spaces, and — flagged separately, because they
 * are style rather than evidence — smart punctuation and em dashes.
 *
 * It does NOT detect or remove Anthropic's statistical watermark. That mark is
 * distributional (it lives in word choice, not in bytes), the detection key is
 * not public, and nothing in this file could touch it. See the README for the
 * long version; the short version is that anyone selling you removal of it is
 * selling you a regex with a story attached.
 */

export {
  detect,
  clean,
  total,
  describe,
  ARTIFACT_CLASSES,
  DEFAULT_CLEAN_OPTIONS,
} from "./artifacts.js";

export type {
  ArtifactKind,
  Finding,
  CleanOptions,
  CleanResult,
} from "./artifacts.js";
