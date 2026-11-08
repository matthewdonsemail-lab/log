import type { Tensor } from '@huggingface/transformers'
import { DESCRIBE_PROMPT, MAX_NEW_TOKENS, REPETITION_PENALTY, VISION_DTYPE, VISION_MODEL } from '../types'
import type { Describer } from '../types'

export async function loadDescriber(model = VISION_MODEL): Promise<Describer> {
  const { AutoModelForImageTextToText, AutoProcessor, RawImage } = await import('@huggingface/transformers')
  const processor = await AutoProcessor.from_pretrained(model)
  const vision = await AutoModelForImageTextToText.from_pretrained(model, { dtype: VISION_DTYPE, device: 'cpu' })
  return {
    model,
    async describe(input: string | Uint8Array, prompt = DESCRIBE_PROMPT) {
      const image = typeof input === 'string' ? await RawImage.read(input) : await RawImage.fromBlob(new Blob([input]))
      const messages = [{ role: 'user', content: [{ type: 'image' }, { type: 'text', text: prompt }] }]
      const text = processor.apply_chat_template(messages, { add_generation_prompt: true }) as string
      const inputs = await processor(image, text, { add_special_tokens: false })
      const output = (await vision.generate({ ...inputs, max_new_tokens: MAX_NEW_TOKENS, do_sample: false, repetition_penalty: REPETITION_PENALTY })) as Tensor
      const length = (inputs.input_ids as { dims: number[] }).dims.at(-1) ?? 0
      const [answer] = processor.batch_decode(output.slice(...([null, [length, null]] as unknown as Parameters<Tensor["slice"]>)), { skip_special_tokens: true }) as string[]
      return answer.trim()
    },
  }
}
