/**
 * Facebook groups (rules 45, 64): joining and answering a group's questions, and reading its posts. Each is a
 * domain of its own; the platform comes first in the code as on the command line (`log facebook join group`).
 */
export * as answer from "./answer/index.ts";
export * as join from "./join/index.ts";
export * as read from "./read/index.ts";
