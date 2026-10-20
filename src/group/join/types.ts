/**
 * Joining a Facebook group as one account (`log join group`, rule 45). Groups
 * are their own library, nothing to do with Marketplace.
 *
 * The lifecycle is the hackathon's `facebookCommunity` machine
 * (`listeningkit-hackathon/apps/web/src/lib/communities/facebook/machine.ts`:
 * notMember → inspectingGate → form… → pendingApproval → member), cut to what
 * a run can see on the group page. The steps Listaro scripted
 * (`Listaro_backup/scripts/join-groups.ts`: open the group, the Join button,
 * "joined"/"member" means already in) are read from a recording of the page
 * instead of matched by text (rule 29): `button "Join Group"` on
 * /groups/4191018610937243/, Bethlehem 2026-10-19.
 */
import type { ErrorCode } from '../../errors/catalog/index'
import type { Application } from '../answer/types'

/** Where the account stands with one group, as Twenty keeps it (`agencyGroups.joinStatus`). */
export const GROUP_JOIN_STATUSES = ['notMember', 'requested', 'member', 'unknown'] as const
export type GroupJoinStatus = (typeof GROUP_JOIN_STATUSES)[number]

/** A group as `--group` names it: a URL, a slug or the numeric id. */
export interface GroupRef {
  /** The part after /groups/: the numeric id, or the group's vanity slug. */
  key: string
  /** True when `key` is Facebook's numeric group id. */
  numeric: boolean
  /** https://www.facebook.com/groups/<key>/ */
  url: string
}

/**
 * What the group page shows, read from one inspect step's reply (its
 * interactive elements, title and URL). `gate` is what the account can do
 * there: `join` (a Join button), `joined` (already in), or `unknown` (a page
 * not recorded yet: a pending request, questions, a closed group all land here
 * until a recording names them).
 */
export interface GroupPage {
  gate: 'join' | 'joined' | 'pending' | 'unknown'
  /** The button the gate was read from, by its name or its own text (`Join Group`). */
  button: string | null
  /** Its ref in this session's snapshot (`e148`): the click goes to it when the button has no name of its own. */
  buttonRef: string | null
  /** True when the snapshot named the button itself (a click by role and name finds it). */
  buttonNamed: boolean
  /**
   * Panels open on the page that move its layout: `relatedGroups` (the "Related groups" panel that
   * opens after a Join and pushes the page down while it loads, Complainers of Bethlehem 2026-10-20).
   */
  panels: string[]
  /** The group's name, from the page title. */
  name: string | null
  /** `17.3K members`, as the page shows it. */
  members: string | null
  /** Facebook's numeric id once the page is open (a slug resolves to it). */
  groupId: string | null
  url: string
}

/** One step's reply the machine reads: the inspect session's `InspectStepResult`, the parts it needs. */
export interface GroupStepReply {
  ok: boolean
  error?: string
  url?: string
  title?: string
  interactive?: string[]
  /** The step's whole snapshot.yml, when the caller read it from the step folder. */
  snapshot?: string
  /** What Facebook answered in the step, read from its network.har by the caller. */
  options?: JoinOptions
  folder?: string
  notable?: string[]
}

export interface GroupJoinInput {
  account: string
  group: GroupRef
  /** Click Join (rule 8). Without it the run opens the group, reads the gate and stops. */
  live: boolean
}

export interface GroupJoinContext extends GroupJoinInput {
  page: GroupPage | null
  after: GroupPage | null
  /** The group page's reply before Join: what `newQuestions` compares against. */
  opened: GroupStepReply | null
  /** The join form as this run saw it (patched into `joinSubmission` after every step). */
  formPhase: FormPhase
  dialog: JoinDialog | null
  options: JoinOptions | null
  inference: JoinInference | null
  questions: string[]
  submittedAt: string | null
  status: GroupJoinStatus
  problem: { code: ErrorCode; detail: string } | null
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[]
}

export interface GroupJoinOutput {
  account: string
  group: GroupRef
  /**
   * read: dry run, the gate read; alreadyIn: a member before the run; joined:
   * a member after the click; clicked: Join was pressed, the request went and
   * the page shows something not recorded yet (a request waiting); questions:
   * Join opened a dialog and the account is not a member yet (its questions
   * kept in `joinSubmission`, left unanswered). A member whose group then asks
   * for a request to participate is `joined`, with the dialog in `joinSubmission`;
   * stopped: a page or step problem.
   */
  result: 'read' | 'alreadyIn' | 'alreadyRequested' | 'joined' | 'clicked' | 'questions' | 'stopped'
  status: GroupJoinStatus
  page: GroupPage | null
  after: GroupPage | null
  problem: { code: ErrorCode; detail: string } | null
  steps: GroupJoinContext['steps']
  formPhase: FormPhase
  dialog: JoinDialog | null
  options: JoinOptions | null
  inference: JoinInference | null
  questions: string[]
  submittedAt: string | null
}

/**
 * The join form's phase, the hackathon's `StoredFormPhase` (communities/types.ts)
 * plus `submitted`: idle (no form seen), rendered (questions shown),
 * incomplete (drafts saved, not sent), submitting, submitted, abandoned.
 */
export const FORM_PHASES = ['idle', 'rendered', 'incomplete', 'submitting', 'submitted', 'abandoned'] as const
export type FormPhase = (typeof FORM_PHASES)[number]

/** One patch to the submission, in the order the run made it. */
export interface SubmissionEntry {
  at: string
  /** The machine state that made it: opening, joining, checking. */
  step: string
  formPhase: FormPhase
  detail: string
  /** The run's step folder (snapshot, screenshot, HAR, rea). */
  folder: string | null
}

/**
 * Facebook's question types, camelCase at the boundary (rule 1). Recorded on
 * Bethlehem's groups, 2026-10-20: PARAGRAPH (Friends of Bethlehem PA,
 * Complainers of Bethlehem) and CHECKBOXES (Complainers: Yes / No). A type no
 * recording has shown is `notRecorded`, its raw name kept: the stepper shows it
 * and does not guess a prompt for it (rule 29).
 */
export const JOIN_QUESTION_TYPES = ['paragraph', 'checkboxes'] as const
export type JoinQuestionType = (typeof JOIN_QUESTION_TYPES)[number]

export interface JoinQuestionOption {
  /** Facebook's option id (`2345806655660910`). */
  id: string
  label: string
}

/** One question a group asks, from Facebook's own query, never from page text. */
export interface JoinQuestion {
  /** Facebook's question id (`2345806658994243`): answers are keyed on it. */
  id: string
  /** membership: before the request goes (private groups); participation: before posting (public ones). */
  stage: 'membership' | 'participation'
  prompt: string
  type: JoinQuestionType | 'notRecorded'
  /** `PARAGRAPH`, `CHECKBOXES`, as Facebook sent it. */
  rawType: string
  options: JoinQuestionOption[]
}

export interface JoinRule {
  id: string
  title: string
  description: string
}

/**
 * The join paths, each recorded with --live on Bethlehem, 2026-10-20:
 *   instant           GroupCometJoinForumMutation MEMBER, no questions query (Bethlehem, PA Neighborhood)
 *   instantRules      MEMBER, then participation: rules to agree, no questions (Recommendations of Bethlehem)
 *   instantQuestions  MEMBER, then participation questions and rules (Friends of Bethlehem PA)
 *   request           useGroupRequestToJoinMutation REQUESTED, membership questions to answer
 *                     before admins review it (Complainers of Bethlehem, You know you're from Bethlehem)
 *   unknown           no answer read from the click's HAR: inferred from the page, ambiguous
 */
export const JOIN_PATHS = ['instant', 'instantRules', 'instantQuestions', 'request', 'unknown'] as const
export type JoinPath = (typeof JOIN_PATHS)[number]

/**
 * The join options: what this group asks of the account after Join, from what
 * Facebook answered in the click's HAR (`readJoinOptions`). The schema the
 * join submission keeps (`joinSubmission.options`) and the Clack stepper is
 * built from (`log join group --answer`).
 */
export interface JoinOptions {
  path: JoinPath
  /** The mutation that joined: GroupCometJoinForumMutation (public) or useGroupRequestToJoinMutation (private). */
  joinOperation: string | null
  /** Its `viewer_join_state`, raw: MEMBER, REQUESTED. */
  viewerJoinState: string | null
  /** The questions query's `viewer_forum_join_state`, raw (CANNOT_JOIN while a request waits). */
  forumJoinState: string | null
  /**
   * `viewer_membership_questions_answer_state`, raw: NO_ANSWER before the answers went,
   * QUESTIONNAIRE_COMPLETED after useGroupMembershipAnswersSaveMutation (Complainers of Bethlehem,
   * 2026-10-20). Read from the answers mutation and from the group page's own HTML.
   */
  answerState: string | null
  /** Where viewerJoinState came from: a join mutation, or the group page's HTML on a load (`groupPage`). */
  stateSource: string | null
  questions: JoinQuestion[]
  /** `viewer_must_answer_membership_question_to_submit`. */
  mustAnswerToSubmit: boolean | null
  /** `is_rules_agreement_enabled`. */
  rulesAgreementRequired: boolean | null
  rules: JoinRule[]
  emailVerificationQuestion: boolean | null
  /** The dialog's own words, as Facebook sent them (title, headline, body, explanation). */
  dialog: { title: string | null; headline: string | null; body: string | null; explanation: string | null } | null
  /** A questions query (participation or membership) was in the click's HAR. */
  questionsQueried: boolean
  /** One line per response read, for the history. */
  seen: string[]
}

/** An answer: a paragraph's text, or the ids of the checkboxes ticked. */
export type JoinAnswer = string | string[]

/** The answers given in the Clack stepper, keyed on Facebook's question ids. Never sent by the stepper itself. */
export interface JoinDraft {
  answers: Record<string, JoinAnswer>
  rulesAgreed: boolean
  /** `hashQuestionSet` of the question ids it was given for: a changed set re-asks. */
  questionsHash: string
  savedAt: string
}

/** Where the account stands, inferred: Facebook's answers first, the page second (`inferJoinState`). */
export interface JoinInference {
  status: GroupJoinStatus
  path: JoinPath
  /** What stands between a member and posting: nothing, the rules, questions, or not known. */
  posting: 'open' | 'rulesAgreement' | 'questions' | 'unknown'
  /** True when no response settled the membership (the page alone, or an unrecorded value). */
  ambiguous: boolean
  /** The signals that decided, in order (`GroupCometJoinForumMutation.viewer_join_state=MEMBER`). */
  inferredFrom: string[]
}

/**
 * The dialog Facebook opens after Join, read from inside it only. Recorded
 * on Bethlehem in AdsPower, 2026-10-20: `dialog "Participant questions"`
 * ("You're now a member of this public group. Get started by submitting a
 * request to participate"), the group's numbered rules, `checkbox "I agree to
 * the group rules"`, and `Submit` disabled until it is ticked. The page's
 * reading, kept as the fallback when the HAR has no answer.
 */
export interface JoinDialog {
  title: string
  /** What it says, line by line (the member line, the review line). */
  notes: string[]
  /** The text questions: its named textboxes. */
  questions: string[]
  /** What must be ticked: its checkboxes (`I agree to the group rules`). */
  agreements: string[]
  /** The group's rules as numbered in it (`1. Be kind and courteous`). */
  rules: string[]
  /** Whether its Submit button can be pressed yet. */
  submitEnabled: boolean | null
}

/**
 * The join submission, `agencyGroups.joinSubmission` (RAW_JSON): the
 * hackathon's `StoredCommunityJoin` form half and its `reportCommunityForm`
 * body (`phase, questions, questionsHash, draftAnswers`), camelCase, with the
 * join options (the schema) and the stepper's draft. Patched after every step
 * of a run (`patchSubmission`) and by the stepper, read back by `log join group`.
 */
export interface GroupJoinSubmission {
  formPhase: FormPhase
  /** The dialog's title (`Participant questions`), when one was shown. */
  dialogTitle: string | null
  dialogNotes: string[]
  /** The entry questions as the page showed them, in order. */
  questions: string[]
  agreements: string[]
  rules: string[]
  submitEnabled: boolean | null
  /** The schema: what the group asks, from Facebook's own answers. */
  options: JoinOptions | null
  /** What was inferred from them (the ambiguous state, settled or not). */
  inference: JoinInference | null
  /** The Clack stepper's answers (`log join group --answer`), keyed on question ids. */
  draft: JoinDraft | null
  /** Where the application stands: drafted, ready, filling, filled, submitted (`log join group --fill`). */
  application: Application | null
  /** `hashQuestionSet(questions)`: answers carry over only while it matches. */
  questionsHash: string | null
  questionsScrapedAt: string | null
  /** Unsent answers for the current question set. */
  draftAnswers: string[]
  /** Answers sent with the request. */
  answers: string[]
  answersComplete: boolean
  submittedAt: string | null
  lastActivityAt: string | null
  history: SubmissionEntry[]
}

/** A group row in Twenty (`agencyGroups`), the fields log-cli reads. */
export interface Group {
  id: string
  name: string | null
  socialAccountId: string | null
  facebookGroupId: string | null
  groupUrl: string | null
  joinStatus: GroupJoinStatus | null
  joinStatusReason: string | null
  membersLabel: string | null
  joinRequestedAt: string | null
  lastCheckedAt: string | null
  joinSubmission: GroupJoinSubmission
}
