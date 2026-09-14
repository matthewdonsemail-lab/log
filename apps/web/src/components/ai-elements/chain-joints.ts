/**
 * Central kitchen for chain-of-thought rail geometry.
 *
 * Every class below is a FULL LITERAL string. Tailwind only generates CSS
 * for classes it can read statically — never build these with template
 * interpolation (e.g. `h-[${n}px]`) or the CSS silently vanishes, including
 * in production builds. If a measurement needs tuning, add a new named
 * literal here; every call site picks it up at once.
 *
 * Geometry recap (all in step-local coordinates):
 * - Trunk icon boxes are 40px wide, so the trunk rail sits at x=20.
 * - Nested content starts 48px in (40px icon + 8px gap); nested icons are
 *   28px. Entry elbows live at left:-29px so their vertical lands on x=20.
 *
 * Color recap: the joints own geometry + label ink ONLY. Rails, tracks,
 * elbows and icon boxes live in ChainOfThoughtStep (see its `tone` prop) —
 * pass the same tone here so the label ink matches the surface the chain
 * sits on.
 */

export type ChainTone = 'white' | 'brand-blue';

/**
 * Label ink per tone — full literals only (see note above). White for chains
 * sitting on blue panels (onboarding reveal); deep navy for chains on the
 * white card (dashboard related-keywords form).
 */
const INK_WHITE = 'text-white';
const INK_BLUE = 'text-[#0B3E91]';

const BASE_MAIN = 'pb-6 text-xl sm:text-2xl';
const BASE_NESTED = 'pb-3 text-xl sm:text-2xl';
const BASE_SUB = 'text-xl sm:text-2xl';

const ICON_40 = '[&>div:first-child>span:first-child]:size-10';
const UNCLIP = '[&>div:last-child]:overflow-visible';
const TRUNK_RAIL = '[&>div:first-child>div:last-child]:bottom-auto [&>div:first-child>div:last-child]:h-[64px]';
const ENTRY_RAIL =
  '[&>div:first-child>div:last-child]:mt-0 [&>div:first-child>div:last-child]:bottom-auto [&>div:first-child>div:last-child]:h-[96px]';
const TERMINAL_RAIL = '[&>div:first-child>div:last-child]:bottom-0';

function ink(tone: ChainTone): string {
  return tone === 'brand-blue' ? INK_BLUE : INK_WHITE;
}

/** Plain top-level step: 40px icon, default auto rail. */
export function mainStep(tone: ChainTone = 'white'): string {
  return `${BASE_MAIN} ${ink(tone)} ${ICON_40}`;
}

/**
 * Trunk step (parent of a nested sub-chain): fixed 64px rail — never full
 * height, or it doubles the nested rails into one long line — plus
 * unclipped content so the entry elbow below isn't cut off.
 */
export function trunkStep(tone: ChainTone = 'white'): string {
  return `${BASE_MAIN} ${ink(tone)} ${ICON_40} ${UNCLIP} ${TRUNK_RAIL}`;
}

/** Nested entry step: 96px rail tuned to meet the trunk rail above it. */
export function entryStep(tone: ChainTone = 'white'): string {
  return `${BASE_NESTED} ${ink(tone)} ${ENTRY_RAIL}`;
}

/** Plain nested step: text sizing only, rail comes from compact/elbow props. */
export function subStep(tone: ChainTone = 'white'): string {
  return `${BASE_SUB} ${ink(tone)}`;
}

/** Roomier nested intro step (no rail overrides). */
export function nestedIntroStep(tone: ChainTone = 'white'): string {
  return `${BASE_NESTED} ${ink(tone)}`;
}

/** Nested terminal step: rail ends flush at its row. */
export function nestedTerminalStep(tone: ChainTone = 'white'): string {
  return `${BASE_NESTED} ${ink(tone)} ${TERMINAL_RAIL}`;
}

/** Terminal step (question/close): rail ends flush at its row, no dangle. */
export function terminalStep(tone: ChainTone = 'white'): string {
  return `${BASE_MAIN} ${ink(tone)} ${ICON_40} ${TERMINAL_RAIL}`;
}
