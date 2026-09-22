import { z } from 'zod'
import { convexClient, convexErrorMessage, dmSendRef } from './convex'

export const liveThreadSchema = z.object({
  id: z.string(),
  platform: z.enum(['facebook', 'x', 'reddit']),
  peerHandle: z.string(),
  peerName: z.string().nullable(),
  lastMessageAt: z.number(),
  lastMessagePreview: z.string().nullable(),
})
export type LiveThread = z.infer<typeof liveThreadSchema>

export const liveThreadsSchema = z.array(liveThreadSchema)

export const liveDmMessageSchema = z.object({
  id: z.string(),
  direction: z.enum(['in', 'out']),
  text: z.string(),
  sentAt: z.number(),
  status: z.enum(['sent', 'pending', 'failed']),
})
export type LiveDmMessage = z.infer<typeof liveDmMessageSchema>
export const liveDmMessagesSchema = z.array(liveDmMessageSchema)

/** Queues a reply. The X helper on the person's own computer sends it for real and the status updates live. */
export async function sendLiveDm(threadId: string, text: string): Promise<LiveDmMessage> {
  const client = await convexClient()
  try {
    return liveDmMessageSchema.parse(await client.mutation(dmSendRef, { threadId, text }))
  } catch (error) {
    throw convexErrorMessage(error, 'Could not send the message')
  }
}
