import type { ProfileContext, ProfileOutput, ProfilePlanStep } from "../../../marketplace/profile/index.ts";

/** What the trace line shows for each step of the profile machine. */
export function summarizeProfile(context: unknown): Record<string, unknown> {
  const c = context as ProfileContext | undefined;
  if (!c) return {};
  const detail: Record<string, unknown> = {};
  if (c.page) detail.page = c.page.kind;
  if (c.uploaded.length) detail.uploaded = c.uploaded.join(",");
  if (c.failure) detail.failure = c.failure.code;
  return detail;
}

const ACTION_TEXT: Record<ProfilePlanStep["action"], string> = {
  wouldUpload: "would upload (dry run)",
  uploaded: "uploaded",
  noPhotoInTwenty: "no photo set in Twenty",
  noControl: "no control for it on the page",
  wouldRename: "would rename (dry run)",
  alreadyNamed: "already has that name",
  noNameInTwenty: "no profileName set in Twenty",
  renameNotBuilt: "not changed: the rename is built from this dry run's nameFound.txt first",
};

const ITEM_TEXT: Record<ProfilePlanStep["item"], string> = { profilePhoto: "Profile photo", coverPhoto: "Cover photo", name: "Name" };

/** The run in plain lines: each photo, and what ended it. */
export function renderProfile(accountName: string, output: ProfileOutput, runDir: string | null): string {
  const lines = [`Profile setup for ${accountName}: ${output.result}${output.live ? "" : " (dry run: nothing changed on Facebook)"}`];
  for (const step of output.plan) {
    const names = step.item === "name" && step.wanted ? ` ("${step.current ?? "?"}" → "${step.wanted}")` : "";
    lines.push(`  ${ITEM_TEXT[step.item]}: ${ACTION_TEXT[step.action]}${names}${step.control ? ` (page control: "${step.control}")` : ""}`);
  }
  if (output.page) lines.push(`  Page: ${output.page.kind}, ${output.page.controls} controls, ${output.page.fileInputs} file input(s)`);
  if (output.failure) lines.push(`  Stopped in ${output.failure.state}: ${output.failure.code}${output.failure.detail ? ` (${output.failure.detail})` : ""}`);
  if (output.namePage) lines.push(`  Name page: ${output.namePage.path}, fields: ${output.namePage.fields.join(", ") || "none found"}, ${output.namePage.controls} controls`);
  if (runDir) lines.push(`  Every control the pages had: ${runDir}/profileFound.txt${output.namePage ? ` and nameFound.txt` : ""}`);
  return lines.join("\n");
}
