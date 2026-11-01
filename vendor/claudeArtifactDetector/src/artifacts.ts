/**
 * Artifact detection and cleaning.
 *
 * This is the deterministic half of claudewatermark.xyz, extracted so it can be
 * run without the site: in CI, in an editor plugin, in a paste handler, or from
 * a shell pipe. The regexes and the deterministic/stylistic split are kept in
 * lockstep with lib/engines/artifacts.ts in the site repo, because a library
 * that disagrees with the hosted checker is worse than no library.
 *
 * Everything here is pure string work. No I/O, no dependencies, no Node
 * built-ins — so the same file runs in a browser paste handler where the text
 * never leaves the machine.
 */

export type ArtifactKind =
  | "claude-html-class"
  | "ai-html-attr"
  | "zero-width"
  | "nbsp"
  | "exotic-space"
  | "smart-punctuation"
  | "em-dash";

export interface Finding {
  kind: ArtifactKind;
  /** Human-readable name, matching what the hosted checker prints. */
  label: string;
  /** How many individual characters or attributes matched. */
  count: number;
  /**
   * True when presence is a fact about the bytes rather than a judgement about
   * the prose. A deterministic finding cannot be a false positive; a
   * non-deterministic one is a stylistic tell that plenty of humans produce.
   */
  deterministic: boolean;
  /** Why this matters, in one paragraph. Safe to print straight to a user. */
  why: string;
}

export interface CleanOptions {
  stripHtmlArtifacts?: boolean;
  stripZeroWidth?: boolean;
  normalizeSpaces?: boolean;
  normalizeQuotes?: boolean;
  /**
   * Em dashes are a *style* tell rather than a technical artifact, but they are
   * the single most recognised one, so we replace them unless asked not to.
   */
  replaceEmDashes?: boolean;
}

export const DEFAULT_CLEAN_OPTIONS: Required<CleanOptions> = {
  stripHtmlArtifacts: true,
  stripZeroWidth: true,
  normalizeSpaces: true,
  normalizeQuotes: true,
  replaceEmDashes: true,
};

// U+200B ZWSP, U+200C ZWNJ, U+200D ZWJ, U+2060 word joiner, U+FEFF BOM
const ZERO_WIDTH = /[​‌‍⁠﻿]/g;
// U+2000–U+200A (en/em/thin/hair/figure family), U+202F narrow NBSP,
// U+205F medium math space, U+3000 ideographic space. U+00A0 is counted
// separately below because it is common enough in ordinary web text to deserve
// its own line in the report rather than being lumped in with the exotics.
const EXOTIC_SPACE = /[ -   　]/g;
const NBSP = / /g;

// Claude's web UI stamps class names onto pasted paragraphs.
const CLAUDE_CLASS = /\sclass\s*=\s*"[^"]*claude[^"]*"/gi;
const CLAUDE_CLASS_SQ = /\sclass\s*=\s*'[^']*claude[^']*'/gi;
// Generic provider fingerprints in pasted markup.
// `data-is-*` is matched as a family rather than enumerated. The upstream list
// used to name is-last-node and is-only-node individually, which meant a real
// Claude attribute from the same family — data-is-streaming, on the response
// container — passed through detection and cleaning untouched. Enumerating
// siblings guarantees the next one is missed too. These are editor and UI state
// flags; none of them carry meaning in pasted prose.
const AI_DATA_ATTR =
  /\sdata-(?:claude|anthropic|gpt|openai|chatgpt|gemini|start|end|is-[\w-]+|message-author-role|testid)(?:-[\w-]+)?\s*=\s*(?:"[^"]*"|'[^']*')/gi;

const SMART_QUOTES: Array<[RegExp, string]> = [
  [/[‘’‚‛]/g, "'"],
  [/[“”„‟]/g, '"'],
  [/…/g, "..."],
  [/‑/g, "-"],
];

const EM_DASH = /—/g;

/**
 * Static description of every class this library knows about.
 *
 * Exported because consumers keep re-deriving it from a run's findings, which
 * only ever describes the classes that happened to be present. Documentation,
 * settings screens and the README table all want the full list, including the
 * ones a given document is clean of.
 */
export const ARTIFACT_CLASSES: ReadonlyArray<{
  kind: ArtifactKind;
  label: string;
  deterministic: boolean;
  why: string;
}> = [
  {
    kind: "claude-html-class",
    label: "Claude HTML class attributes",
    deterministic: true,
    why: 'Class names containing "claude" (e.g. font-claude-response-body). This is the single artifact the AO3 detector looks for. It has no false positives — it can only be here if the text was pasted directly out of Claude.',
  },
  {
    kind: "ai-html-attr",
    label: "AI editor data-attributes",
    deterministic: true,
    why: "Provider-specific data-* attributes left behind by chat UIs when pasting into a rich-text editor.",
  },
  {
    kind: "zero-width",
    label: "Zero-width characters",
    deterministic: true,
    why: "Invisible characters (ZWSP/ZWNJ/ZWJ/BOM). Often benign, but they survive copy-paste and are trivially greppable.",
  },
  {
    kind: "nbsp",
    label: "Non-breaking spaces",
    deterministic: true,
    why: "U+00A0. Very common in web-copied text and a frequent false-positive source in naive AI checkers.",
  },
  {
    kind: "exotic-space",
    label: "Unusual Unicode spaces",
    deterministic: true,
    why: "Thin/narrow/figure spaces. Rare in hand-typed text.",
  },
  {
    kind: "smart-punctuation",
    label: "Typographic punctuation",
    deterministic: false,
    why: "Curly quotes and ellipsis characters. A weak stylistic signal, not proof of anything.",
  },
  {
    kind: "em-dash",
    label: "Em dashes",
    deterministic: false,
    why: "A style tell people associate with LLM writing. Not a technical artifact — removing them is a stylistic choice.",
  },
];

const CLASS_BY_KIND = new Map(ARTIFACT_CLASSES.map((c) => [c.kind, c]));

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

function counts(text: string): Record<ArtifactKind, number> {
  return {
    "claude-html-class":
      countMatches(text, CLAUDE_CLASS) + countMatches(text, CLAUDE_CLASS_SQ),
    "ai-html-attr": countMatches(text, AI_DATA_ATTR),
    "zero-width": countMatches(text, ZERO_WIDTH),
    nbsp: countMatches(text, NBSP),
    "exotic-space": countMatches(text, EXOTIC_SPACE),
    "smart-punctuation": SMART_QUOTES.reduce(
      (n, [re]) => n + countMatches(text, re),
      0,
    ),
    "em-dash": countMatches(text, EM_DASH),
  };
}

/**
 * Non-destructive scan. Cheap enough to run on every keystroke — 200KB of prose
 * measures at ~11ms — so callers do not need to debounce it for correctness,
 * only for render churn.
 */
export function detect(text: string): Finding[] {
  const n = counts(text);
  const findings: Finding[] = [];
  for (const c of ARTIFACT_CLASSES) {
    const count = n[c.kind];
    if (count > 0) findings.push({ ...c, count });
  }
  return findings;
}

export interface CleanResult {
  text: string;
  /**
   * The findings this call actually acted on.
   *
   * Deliberately not "everything detected": switching off replaceEmDashes must
   * not produce a report claiming em dashes were removed. The hosted tool once
   * shipped that bug in the opposite direction — it reported findings as
   * removed while returning them still in the text — and it is the fastest way
   * to lose a user's trust in a cleaner.
   */
  removed: Finding[];
}

/**
 * Merge caller options over the defaults, ignoring keys set to `undefined`.
 *
 * A plain spread does not do this: `{ ...DEFAULTS, replaceEmDashes: undefined }`
 * yields `undefined`, which is falsy, so the default is silently inverted. Any
 * caller that builds its options object by reading fields off a parsed JSON
 * body — the site's own API route did — disables every flag it omits.
 */
function withDefaults(options: CleanOptions): Required<CleanOptions> {
  const merged = { ...DEFAULT_CLEAN_OPTIONS };
  for (const [k, v] of Object.entries(options)) {
    if (v !== undefined) merged[k as keyof CleanOptions] = v as boolean;
  }
  return merged;
}

/** Deterministic clean. No network, no model, no cost. */
export function clean(input: string, options: CleanOptions = {}): CleanResult {
  const opts = withDefaults(options);
  const before = counts(input);
  let text = input;

  if (opts.stripHtmlArtifacts) {
    text = text
      .replace(CLAUDE_CLASS, "")
      .replace(CLAUDE_CLASS_SQ, "")
      .replace(AI_DATA_ATTR, "");
  }
  if (opts.stripZeroWidth) text = text.replace(ZERO_WIDTH, "");
  if (opts.normalizeSpaces) {
    text = text.replace(NBSP, " ").replace(EXOTIC_SPACE, " ");
  }
  if (opts.normalizeQuotes) {
    for (const [re, to] of SMART_QUOTES) text = text.replace(re, to);
  }
  if (opts.replaceEmDashes) {
    // " word — word " -> " word - word "; tight "a—b" -> "a - b". Eating the
    // surrounding whitespace is what stops "a — b" turning into "a  -  b".
    text = text.replace(/\s*—\s*/g, " - ");
  }

  // Normalise line endings and trailing whitespace without touching structure.
  text = text.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");

  const enabled: Record<ArtifactKind, boolean> = {
    "claude-html-class": opts.stripHtmlArtifacts,
    "ai-html-attr": opts.stripHtmlArtifacts,
    "zero-width": opts.stripZeroWidth,
    nbsp: opts.normalizeSpaces,
    "exotic-space": opts.normalizeSpaces,
    "smart-punctuation": opts.normalizeQuotes,
    "em-dash": opts.replaceEmDashes,
  };

  const removed: Finding[] = [];
  for (const c of ARTIFACT_CLASSES) {
    const count = before[c.kind];
    if (count > 0 && enabled[c.kind]) removed.push({ ...c, count });
  }

  return { text, removed };
}

/** Total artifact count across findings, for callers that just want a number. */
export function total(findings: Finding[]): number {
  return findings.reduce((n, f) => n + f.count, 0);
}

/** Look up the static description of a kind without running a scan. */
export function describe(kind: ArtifactKind) {
  return CLASS_BY_KIND.get(kind);
}
