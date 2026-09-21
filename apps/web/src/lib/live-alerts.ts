import { z } from 'zod'
import { alertsSaveRef, alertsSendTestRef, convexClient, convexErrorMessage } from './convex'

export const alertSettingsSchema = z.object({
  /** False when the deployment has no AgentMail credentials, so the form can say so instead of failing. */
  available: z.boolean(),
  email: z.string().nullable(),
  enabled: z.boolean(),
  minScore: z.number(),
  lastSentAt: z.number().nullable(),
})

export type AlertSettings = z.infer<typeof alertSettingsSchema>

/** The bars a person can pick, in plain words. */
export const MIN_SCORE_CHOICES: { value: number; label: string }[] = [
  { value: 60, label: 'Likely (60 and up)' },
  { value: 70, label: 'Strong (70 and up)' },
  { value: 80, label: 'Very strong (80 and up)' },
  { value: 90, label: 'Only the best (90 and up)' },
]

export async function saveAlertSettings(input: { email: string; enabled: boolean; minScore: number }): Promise<void> {
  const client = await convexClient()
  try { await client.mutation(alertsSaveRef, input) } catch (error) {
    throw convexErrorMessage(error, 'Could not save your email settings')
  }
}

export async function sendTestAlert(): Promise<void> {
  const client = await convexClient()
  try { await client.action(alertsSendTestRef, {}) } catch (error) {
    throw convexErrorMessage(error, 'Could not send the test email')
  }
}
