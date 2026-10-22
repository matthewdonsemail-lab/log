import type { GroupJoinStatus, GroupPage, JoinDialog, JoinInference, JoinOptions, JoinPath, JoinQuestion, JoinRule } from '../types'
import { JOIN_QUESTION_TYPES } from '../types'

interface HarEntry {
  request: { method?: string; url?: string; postData?: { text?: string } }
  response: { status: number; content?: { text?: string } }
}

const JOIN_MUTATIONS = ['GroupCometJoinForumMutation', 'useGroupRequestToJoinMutation']
const PARTICIPATION_QUERY = 'GroupsCometRequestToParticipateOnJoinDialogQuery'
const MEMBERSHIP_QUERY = 'GroupsCometMembershipQuestionsPreloadedDialogQuery'
const ANSWERS_MUTATION = 'useGroupMembershipAnswersSaveMutation'

const fieldIn = (text: string, name: string) => new RegExp(`"${name}":"([A-Z_]+)"`).exec(text)?.[1] ?? null

function operationOf(body: string): string | null {
  return /(?:^|&)fb_api_req_friendly_name=([A-Za-z0-9_]+)/.exec(body)?.[1] ?? null
}

function groupOf(text: string): Record<string, unknown> | null {
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('{')) continue
    try {
      const group = (JSON.parse(line) as { data?: { group?: Record<string, unknown> } }).data?.group
      if (group) return group
    } catch {
    }
  }
  return null
}

const str = (v: unknown) => (typeof v === 'string' && v ? v : null)
const bool = (v: unknown) => (typeof v === 'boolean' ? v : null)

function typeOf(raw: string): JoinQuestion['type'] {
  const camel = raw.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
  return (JOIN_QUESTION_TYPES as readonly string[]).includes(camel) ? (camel as JoinQuestion['type']) : 'notRecorded'
}

function questionsFrom(block: unknown, stage: JoinQuestion['stage']): JoinQuestion[] {
  const list = (block as { questions?: Record<string, unknown>[] } | null)?.questions ?? []
  return list.map((q) => ({
    id: String(q.id ?? ''),
    stage,
    prompt: String(q.question ?? ''),
    type: typeOf(String(q.question_type ?? '')),
    rawType: String(q.question_type ?? ''),
    options: ((q.question_options as Record<string, unknown>[] | undefined) ?? []).map((o) => ({ id: String(o.id ?? ''), label: String(o.question_option ?? '') }))
  }))
}

function rulesFrom(group: Record<string, unknown>): JoinRule[] {
  const nodes = (group.group_rules as { nodes?: Record<string, unknown>[] } | undefined)?.nodes ?? []
  return nodes.map((n) => ({ id: String(n.id ?? ''), title: String(n.rule_title ?? ''), description: String((n.description_with_entities as { text?: string } | undefined)?.text ?? '') }))
}

export function readJoinOptions(har: { log: { entries: HarEntry[] } }): JoinOptions {
  const options: JoinOptions = {
    path: 'unknown',
    joinOperation: null,
    viewerJoinState: null,
    forumJoinState: null,
    answerState: null,
    stateSource: null,
    questions: [],
    mustAnswerToSubmit: null,
    rulesAgreementRequired: null,
    rules: [],
    emailVerificationQuestion: null,
    dialog: null,
    questionsQueried: false,
    seen: []
  }
  for (const entry of har.log.entries) {
    const operation = operationOf(entry.request.postData?.text ?? '')
    const text = entry.response.content?.text ?? ''
    if (!operation && entry.request.method === 'GET' && /\/groups\/[^/?#]+\/?$/.test((entry.request.url ?? '').split('?')[0])) {
      const state = fieldIn(text, 'viewer_join_state')
      if (state && !options.joinOperation) {
        options.viewerJoinState = state
        options.stateSource = 'groupPage'
      }
      options.forumJoinState = fieldIn(text, 'viewer_forum_join_state') ?? options.forumJoinState
      options.answerState = fieldIn(text, 'viewer_membership_questions_answer_state') ?? options.answerState
      if (state) options.seen.push(`group page ${entry.response.status}: viewer_join_state ${state}${options.answerState ? `, answers ${options.answerState}` : ''}`)
      continue
    }
    if (!operation) continue
    if (operation === ANSWERS_MUTATION) {
      options.answerState = fieldIn(text, 'viewer_membership_questions_answer_state') ?? options.answerState
      options.viewerJoinState = fieldIn(text, 'viewer_join_state') ?? options.viewerJoinState
      options.stateSource = operation
      options.seen.push(`${operation} ${entry.response.status}: answers ${options.answerState}, viewer_join_state ${options.viewerJoinState}`)
      continue
    }
    if (JOIN_MUTATIONS.includes(operation)) {
      const state = /"viewer_join_state":"([A-Z_]+)"/.exec(text)?.[1] ?? null
      if (!state) continue
      options.joinOperation = operation
      options.viewerJoinState = state
      options.stateSource = operation
      options.seen.push(`${operation} ${entry.response.status}: viewer_join_state ${state}`)
      continue
    }
    if (operation !== PARTICIPATION_QUERY && operation !== MEMBERSHIP_QUERY) continue
    const group = groupOf(text)
    if (!group) continue
    options.questionsQueried = true
    const membership = questionsFrom(group.if_viewer_can_see_membership_questions, 'membership')
    const participation = questionsFrom(group.if_viewer_can_see_participation_questions, 'participation')
    options.questions = [...membership, ...participation]
    options.forumJoinState = str(group.viewer_forum_join_state) ?? options.forumJoinState
    options.mustAnswerToSubmit = bool(group.viewer_must_answer_membership_question_to_submit) ?? options.mustAnswerToSubmit
    options.rulesAgreementRequired = bool(group.is_rules_agreement_enabled)
    options.rules = rulesFrom(group)
    options.emailVerificationQuestion = bool(group.has_email_verification_question)
    const words = (group.forum_admin_join_only_participation_request_questionnaire ?? null) as Record<string, unknown> | null
    options.dialog = {
      title: str(words?.title),
      headline: str(words?.headline),
      body: str(words?.body),
      explanation: str(group.participation_questionnaire_explanation_text)
    }
    options.seen.push(`${operation} ${entry.response.status}: ${membership.length} membership, ${participation.length} participation question(s), rules agreement ${options.rulesAgreementRequired}`)
  }
  options.path = pathOf(options)
  return options
}

export function pathOf(options: Pick<JoinOptions, 'viewerJoinState' | 'questions' | 'rulesAgreementRequired' | 'questionsQueried'>): JoinPath {
  if (options.viewerJoinState === 'REQUESTED') return 'request'
  if (options.viewerJoinState !== 'MEMBER') return 'unknown'
  if (options.questions.length) return 'instantQuestions'
  if (options.rulesAgreementRequired) return 'instantRules'
  return 'instant'
}

const JOIN_STATES: Record<string, GroupJoinStatus> = { MEMBER: 'member', REQUESTED: 'requested' }

export function inferJoinState(options: JoinOptions | null, page: GroupPage | null, dialog: JoinDialog | null): JoinInference {
  const from: string[] = []
  let status: GroupJoinStatus = 'unknown'
  let ambiguous = true
  if (options?.viewerJoinState) {
    status = JOIN_STATES[options.viewerJoinState] ?? 'unknown'
    ambiguous = !(options.viewerJoinState in JOIN_STATES)
    from.push(`${options.stateSource ?? options.joinOperation}.viewer_join_state=${options.viewerJoinState}`)
  } else if (page?.gate === 'joined' || page?.gate === 'join') {
    status = page.gate === 'joined' ? 'member' : 'notMember'
    from.push(`page button "${page.button}"`)
  }
  let posting: JoinInference['posting'] = 'unknown'
  if (options?.questionsQueried) {
    posting = options.questions.length ? 'questions' : options.rulesAgreementRequired ? 'rulesAgreement' : 'open'
    from.push(`${options.questions.length} question(s), rules agreement ${options.rulesAgreementRequired}`)
  } else if (options?.viewerJoinState === 'MEMBER' && !dialog) {
    posting = 'open'
    from.push('no questions query after Join, no dialog')
  } else if (dialog) {
    posting = dialog.questions.length ? 'questions' : dialog.agreements.length ? 'rulesAgreement' : 'unknown'
    from.push(`dialog "${dialog.title}"`)
  }
  const path = options && !ambiguous ? options.path : 'unknown'
  return { status, path, posting, ambiguous, inferredFrom: from }
}
