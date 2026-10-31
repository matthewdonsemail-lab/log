export const REVIEW_MODEL = "subq-snap-1.1";
export const REVIEW_BLOCK_AT = 0.75;
export const DIGEST_MAX_CHARS = 120_000;

export type PageVerdict = "current" | "update" | "move";

export const PAGE_CRITERIA: Readonly<Record<PageVerdict, string>> = {
  current: "The session didn't do this page's work, or did it the way the page says: nothing on the page is wrong or missing",
  update: "The session did this page's work differently, or learned something the page doesn't say (a new step, a different tool or order, a new rule, a lesson): the page is stale and needs updating",
  move: "The work this page describes belongs on another page, or should be split from or merged with another use case",
};

export interface SessionDigest {
  asks: string[];
  work: string[];
  text: string;
}

export interface PageReview {
  id: string;
  verdict: PageVerdict;
  confidence: number;
  staged: boolean;
  blocks: boolean;
}

export interface UseCaseReview {
  pages: PageReview[];
  uncovered: number;
  uncoveredBlocks: boolean;
  blocked: boolean;
}
