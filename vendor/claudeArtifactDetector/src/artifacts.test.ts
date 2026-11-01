/**
 * Tests run against the compiled output via node:test, so there is no test
 * runner dependency and no transpiler in the loop — the thing under test is the
 * exact JavaScript that ships.
 *
 * Every artifact class gets a positive case, and the whole set gets the one
 * test that actually matters for a cleaner: clean(text) must re-detect as
 * empty. The hosted tool once reported findings and returned them still in the
 * text, and no per-class assertion would have caught it.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detect,
  clean,
  total,
  describe,
  ARTIFACT_CLASSES,
  type ArtifactKind,
} from "./index.js";

/** The site's own sample paste — one of every class the engine detects. */
const SAMPLE = [
  '<p class="font-claude-response-body" data-is-streaming="false">',
  "The results were unambiguous​ — revenue rose 20% quarter over quarter. ",
  "She called it “a genuine inflection point” and, frankly, the numbers agree.",
  " Margins held.</p>",
].join("");

function kinds(text: string): ArtifactKind[] {
  return detect(text).map((f) => f.kind);
}

function countOf(text: string, kind: ArtifactKind): number {
  return detect(text).find((f) => f.kind === kind)?.count ?? 0;
}

test("clean text produces no findings", () => {
  assert.deepEqual(detect("Just ordinary prose, typed by a person."), []);
  assert.deepEqual(detect(""), []);
});

test("claude-html-class: double and single quoted", () => {
  assert.equal(
    countOf('<p class="font-claude-response-body">hi</p>', "claude-html-class"),
    1,
  );
  assert.equal(
    countOf("<p class='prose claude-body'>hi</p>", "claude-html-class"),
    1,
  );
  // A class attribute with no "claude" in it is not an artifact; flagging every
  // pasted class name would make the deterministic label a lie.
  assert.equal(countOf('<p class="prose">hi</p>', "claude-html-class"), 0);
});

test("ai-html-attr: the data-is-* family, not just enumerated members", () => {
  assert.equal(countOf('<div data-is-streaming="false">', "ai-html-attr"), 1);
  assert.equal(countOf('<div data-is-last-node="true">', "ai-html-attr"), 1);
  assert.equal(
    countOf('<div data-message-author-role="assistant">', "ai-html-attr"),
    1,
  );
  assert.equal(countOf("<div data-testid='x'>", "ai-html-attr"), 1);
  assert.equal(countOf('<div data-price="10">', "ai-html-attr"), 0);
});

test("zero-width: ZWSP, ZWNJ, ZWJ, word joiner, BOM", () => {
  const text = "a​b‌c‍d⁠e﻿f";
  assert.equal(countOf(text, "zero-width"), 5);
});

test("nbsp is counted apart from the exotic spaces", () => {
  assert.equal(countOf("a b", "nbsp"), 1);
  assert.equal(countOf("a b", "exotic-space"), 0);
});

test("exotic-space: the U+2000–U+200A family plus the strays", () => {
  const text = "a b c d e f g　h";
  assert.equal(countOf(text, "exotic-space"), 7);
});

test("smart-punctuation is counted but marked stylistic", () => {
  const text = "‘a’ “b”… c‑d";
  assert.equal(countOf(text, "smart-punctuation"), 6);
  const finding = detect(text).find((f) => f.kind === "smart-punctuation")!;
  assert.equal(finding.deterministic, false);
});

test("em-dash is counted but marked stylistic", () => {
  assert.equal(countOf("a — b — c", "em-dash"), 2);
  assert.equal(detect("a — b")[0]!.deterministic, false);
});

test("the deterministic/stylistic split is exactly as advertised", () => {
  const deterministic = ARTIFACT_CLASSES.filter((c) => c.deterministic).map(
    (c) => c.kind,
  );
  const stylistic = ARTIFACT_CLASSES.filter((c) => !c.deterministic).map(
    (c) => c.kind,
  );
  assert.deepEqual(deterministic, [
    "claude-html-class",
    "ai-html-attr",
    "zero-width",
    "nbsp",
    "exotic-space",
  ]);
  assert.deepEqual(stylistic, ["smart-punctuation", "em-dash"]);
});

test("the sample paste carries every artifact class", () => {
  assert.deepEqual(
    new Set(kinds(SAMPLE)),
    new Set(ARTIFACT_CLASSES.map((c) => c.kind)),
  );
});

test("clean() output re-detects as empty", () => {
  const { text, removed } = clean(SAMPLE);
  assert.deepEqual(detect(text), [], `residual artifacts in: ${text}`);
  assert.equal(total(removed), total(detect(SAMPLE)));
});

test("clean() leaves the prose intact", () => {
  const { text } = clean(SAMPLE);
  assert.match(text, /revenue rose 20% quarter over quarter/);
  assert.match(text, /"a genuine inflection point"/);
  assert.match(text, /unambiguous - revenue/);
  // The tag survives; only the fingerprinted attributes are cut out.
  assert.match(text, /^<p>/);
});

test("opt-outs are honoured and reported honestly", () => {
  const input = "a — b “c”";
  const { text, removed } = clean(input, {
    replaceEmDashes: false,
    normalizeQuotes: false,
  });
  assert.equal(text, input);
  assert.deepEqual(removed, []);
});

test("an explicit undefined does not silently disable a default", () => {
  // The bug this guards: `{ ...DEFAULTS, replaceEmDashes: undefined }` reads as
  // false, so a caller spreading a parsed JSON body disabled every flag it
  // omitted while the report still claimed the work was done.
  const { text } = clean("a — b", { replaceEmDashes: undefined });
  assert.equal(text, "a - b");
});

test("cleaning is idempotent", () => {
  const once = clean(SAMPLE).text;
  assert.equal(clean(once).text, once);
});

test("line endings normalise without eating structure", () => {
  assert.equal(clean("a\r\nb\rc  \nd").text, "a\nb\nc\nd");
});

test("describe() covers every kind", () => {
  for (const c of ARTIFACT_CLASSES) {
    assert.equal(describe(c.kind)?.label, c.label);
  }
});

test("large input stays fast enough to run on every keystroke", () => {
  const big = SAMPLE.repeat(2000);
  const started = Date.now();
  detect(big);
  assert.ok(Date.now() - started < 2000, "detect() on ~120KB should be quick");
});
