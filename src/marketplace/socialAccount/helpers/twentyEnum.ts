/** `needsLogin` → `NEEDS_LOGIN`: log-cli's camelCase to Twenty's SELECT values. Pure. */
export function toTwentyEnum(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()
}

/** `NEEDS_LOGIN` → `needsLogin`. Pure. */
export function fromTwentyEnum(value: string): string {
  return value.toLowerCase().replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase())
}
