const CITATION = /\b[Rr]ules?\s+(\d+(?:(?:\s*,\s*(?:and\s+)?|\s+and\s+|\s*[-–]\s*|\s+to\s+)\d+)*)/g;
const RANGE_MAX = 40;

export function citationsOf(text: string): number[] {
  const out: number[] = [];
  for (const match of text.matchAll(CITATION)) {
    const parts = [...match[1].matchAll(/(\d+)|([-–]|\bto\b)/g)];
    let rangeNext = false;
    for (const part of parts) {
      if (part[2]) {
        rangeNext = true;
        continue;
      }
      const n = Number(part[1]);
      const last = out.at(-1);
      if (rangeNext && last !== undefined && n > last && n - last <= RANGE_MAX) for (let i = last + 1; i <= n; i++) out.push(i);
      else out.push(n);
      rangeNext = false;
    }
  }
  return out;
}

export interface CitationCount {
  citations: number;
  dead: number;
  worst: { path: string; dead: number }[];
}

export function deadCitations(files: readonly { path: string; text: string }[], ruleIds: ReadonlySet<number>): CitationCount {
  let citations = 0;
  let dead = 0;
  const perFile: { path: string; dead: number }[] = [];
  for (const file of files) {
    const cited = citationsOf(file.text);
    const gone = cited.filter((n) => !ruleIds.has(n)).length;
    citations += cited.length;
    dead += gone;
    if (gone) perFile.push({ path: file.path, dead: gone });
  }
  return { citations, dead, worst: perFile.sort((a, b) => b.dead - a.dead || a.path.localeCompare(b.path)) };
}
