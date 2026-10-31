import type { TwentyClient, TwentyObjects } from '../../../twenty/graphql/index'
import { applicationFromDraft } from '../answer/client'
import { emptySubmission, patchSubmission, readSubmission } from './helpers/index'
import type { Group, GroupJoinContext, GroupJoinOutput, GroupJoinStatus, GroupRef, GroupJoinSubmission, JoinDraft } from './types'
import { GROUP_JOIN_STATUSES } from './types'

export const AGENCY_GROUPS = 'agencyGroups' as const

type GroupRow = TwentyObjects['agencyGroups']['row']
type GroupUpdate = TwentyObjects['agencyGroups']['update']

export const toJoinStatusEnum = (status: GroupJoinStatus) => status.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase() as NonNullable<GroupRow['joinStatus']>

export function fromJoinStatusEnum(raw: unknown): GroupJoinStatus | null {
  if (typeof raw !== 'string' || !raw) return null
  const camel = raw.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
  return (GROUP_JOIN_STATUSES as readonly string[]).includes(camel) ? (camel as GroupJoinStatus) : null
}

export function toGroup(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name ?? null,
    socialAccountId: row.socialAccountId ?? null,
    facebookGroupId: row.facebookGroupId ?? null,
    groupUrl: row.groupUrl ?? null,
    joinStatus: fromJoinStatusEnum(row.joinStatus),
    joinStatusReason: row.joinStatusReason ?? null,
    membersLabel: row.membersLabel ?? null,
    joinRequestedAt: row.joinRequestedAt ?? null,
    lastCheckedAt: row.lastCheckedAt ?? null,
    joinSubmission: readSubmission(row.joinSubmission)
  }
}

export async function findGroup(twenty: TwentyClient, socialAccountId: string, keys: string[]): Promise<Group | null> {
  const wanted = [...new Set(keys.filter(Boolean))]
  if (!wanted.length) return null
  const rows = await twenty.list(AGENCY_GROUPS, { socialAccountId: { eq: socialAccountId }, facebookGroupId: { in: wanted } })
  return rows[0] ? toGroup(rows[0]) : null
}

export async function listGroups(twenty: TwentyClient, socialAccountId: string): Promise<Group[]> {
  return (await twenty.list(AGENCY_GROUPS, { socialAccountId: { eq: socialAccountId } })).map(toGroup)
}

export async function ensureGroup(twenty: TwentyClient, socialAccountId: string, group: GroupRef): Promise<Group> {
  const existing = await findGroup(twenty, socialAccountId, [group.key])
  if (existing) return existing
  const row = await twenty.create(AGENCY_GROUPS, {
    name: group.key,
    socialAccountId,
    facebookGroupId: group.key,
    groupUrl: group.url,
    joinSubmission: emptySubmission()
  } as unknown as TwentyObjects['agencyGroups']['create'])
  return toGroup(row)
}

export async function patchGroupStep(twenty: TwentyClient, group: Group, context: Pick<GroupJoinContext, 'formPhase' | 'dialog' | 'options' | 'inference' | 'questions' | 'submittedAt'>, step: { step: string; detail: string; folder: string | null }, now: Date): Promise<Group> {
  const patch: Partial<Omit<GroupJoinSubmission, 'history'>> = context.formPhase === 'idle' ? {} : { formPhase: context.formPhase }
  if (context.dialog) {
    Object.assign(patch, {
      dialogTitle: context.dialog.title,
      dialogNotes: context.dialog.notes,
      questions: context.dialog.questions,
      agreements: context.dialog.agreements,
      rules: context.dialog.rules,
      submitEnabled: context.dialog.submitEnabled
    })
  }
  if (context.submittedAt) patch.submittedAt = context.submittedAt
  if (context.options) {
    patch.options = context.options
    if (context.options.questions.length) patch.questions = context.options.questions.map((q) => q.prompt)
    const optionLabels = new Set(context.options.questions.flatMap((q) => q.options.map((o) => o.label)))
    if (patch.agreements) patch.agreements = patch.agreements.filter((a) => !optionLabels.has(a))
    if (context.options.rules.length) patch.rules = context.options.rules.map((r, i) => `${i + 1}. ${r.title}`)
  }
  if (context.inference) patch.inference = context.inference
  const joinSubmission = patchSubmission(group.joinSubmission, patch, { at: now.toISOString(), ...step })
  const row = await twenty.update(AGENCY_GROUPS, group.id, { joinSubmission } as unknown as GroupUpdate)
  return toGroup(row)
}

export async function saveDraft(twenty: TwentyClient, group: Group, draft: JoinDraft, complete: { complete: boolean; missing: string[] }, now: Date): Promise<Group> {
  const joinSubmission = patchSubmission(
    group.joinSubmission,
    { draft, formPhase: 'incomplete', draftAnswers: Object.values(draft.answers).map((a) => (Array.isArray(a) ? a.join(', ') : a)), application: applicationFromDraft(group.joinSubmission.options, draft, now) },
    { at: now.toISOString(), step: 'stepper', detail: complete.complete ? 'every answer given in Clack, rules agreed; not sent' : `answers saved in Clack, missing: ${complete.missing.join('; ')}`, folder: null }
  )
  return toGroup(await twenty.update(AGENCY_GROUPS, group.id, { joinSubmission } as unknown as GroupUpdate))
}

export async function recordGroupRead(twenty: TwentyClient, group: Group, output: GroupJoinOutput, runDir: string, now: Date): Promise<Group> {
  const page = output.after ?? output.page
  const reason = `${output.result}${page ? `: gate ${page.gate}${page.button ? ` (button "${page.button}")` : ''}` : ''}${output.problem ? `, ${output.problem.code}: ${output.problem.detail}` : ''}; ${runDir}`
  if (!page) return toGroup(await twenty.update(AGENCY_GROUPS, group.id, { joinStatusReason: reason, lastCheckedAt: now.toISOString() } as GroupUpdate))
  const groupId = output.page?.groupId ?? page.groupId ?? group.facebookGroupId ?? output.group.key
  const fields: GroupUpdate = {
    name: page.name ?? group.name ?? output.group.key,
    facebookGroupId: groupId,
    groupUrl: `https://www.facebook.com/groups/${groupId}/`,
    joinStatus: toJoinStatusEnum(output.status),
    joinStatusReason: reason,
    membersLabel: output.page?.members ?? page.members ?? group.membersLabel,
    lastCheckedAt: now.toISOString(),
    ...(output.after ? { joinRequestedAt: now.toISOString() } : {})
  }
  return toGroup(await twenty.update(AGENCY_GROUPS, group.id, fields))
}
