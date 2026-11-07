export function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  let before: number[] = []
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, before[j - 2] + 1)
      row.push(value)
      best = Math.min(best, value)
    }
    if (best > limit) return limit + 1
    before = previous
    previous = row
  }
  return previous[b.length]
}

export function allowedEdits(word: string): number {
  return word.length >= 8 ? 2 : word.length >= 4 ? 1 : 0
}

export function correctWord(word: string, vocabulary: ReadonlySet<string>): string {
  if (vocabulary.has(word)) return word
  const limit = allowedEdits(word)
  if (!limit) return word
  let best = word
  let bestDistance = limit + 1
  for (const known of vocabulary) {
    if (known[0] !== word[0] && known[0] !== word[1]) continue
    const distance = editDistance(word, known, limit)
    if (distance < bestDistance) {
      best = known
      bestDistance = distance
    }
  }
  return best
}

export function correctTypos(text: string, vocabulary: ReadonlySet<string>): { text: string; corrected: string[] } {
  const corrected: string[] = []
  const out = text.replace(/[A-Za-z]+/g, (raw) => {
    const word = raw.toLowerCase()
    const fixed = correctWord(word, vocabulary)
    if (fixed !== word) corrected.push(`${word}→${fixed}`)
    return fixed
  })
  return { text: out, corrected }
}
