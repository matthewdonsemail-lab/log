export function toTwentyEnum(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()
}

export function fromTwentyEnum(value: string): string {
  return value.toLowerCase().replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase())
}
