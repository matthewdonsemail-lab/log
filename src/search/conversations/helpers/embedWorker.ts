import { pipeline } from '@huggingface/transformers'

const model = process.argv[2]
const extractor = (await pipeline('feature-extraction', model, { dtype: 'q8' })) as unknown as (texts: string[], options: Record<string, unknown>) => Promise<{ data: Float32Array; dims: number[] }>
process.stdout.write(JSON.stringify({ ready: true }) + '\n')

let buffer = ''
for await (const chunk of Bun.stdin.stream()) {
  buffer += new TextDecoder().decode(chunk)
  let newline = buffer.indexOf('\n')
  while (newline >= 0) {
    const line = buffer.slice(0, newline)
    buffer = buffer.slice(newline + 1)
    newline = buffer.indexOf('\n')
    if (!line.trim()) continue
    const { id, texts } = JSON.parse(line) as { id: number; texts: string[] }
    const out = await extractor(texts, { pooling: 'mean', normalize: true })
    const width = out.dims[out.dims.length - 1]
    process.stdout.write(JSON.stringify({ id, width, data: Array.from(out.data) }) + '\n')
  }
}
