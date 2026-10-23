export const PLACEHOLDER: string;
export const AST_HEADING: string;
export function renderEntry(entry: { when: string; branch: string; ast: string }): string;
export function addedLines(diff: string): string[];
export function astBlock(lines: string[]): any;
export function checkAdded(allLines: string[], ast: any): any;
export function replaceLastAstBlock(text: string, ast: any): string;
