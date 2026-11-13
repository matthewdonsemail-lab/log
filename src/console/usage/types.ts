export const USAGE_DAYS = [1, 7, 30] as const;
export type UsageDays = (typeof USAGE_DAYS)[number];

export const USAGE_KIND_LABELS = {
  platformRead: "Platform reads",
  platformWrite: "Platform actions",
  decision: "Decision models",
  media: "Media",
  background: "Background jobs",
  control: "Workspace operations",
  other: "Other",
} as const;
