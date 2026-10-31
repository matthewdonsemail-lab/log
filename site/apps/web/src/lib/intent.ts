const INTENT_WORDS: Record<string, string> = {
  looking_for_help: 'Wants help',
  buying: 'Ready to buy',
  complaint: 'Complaint',
  promotion: 'Promotion',
  discussion: 'Discussion',
  other: 'Other',
}

/** Plain words for what the AI thinks the author wants. */
export function intentLabel(intent: string | null): string {
  return (intent && INTENT_WORDS[intent]) || 'Other'
}
