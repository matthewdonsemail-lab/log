import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'
import type { RequirementAnchors } from '../anchors/index'

const WORKER = 'src/facebook/group/read/helpers/openMagpieWorker.ts'
const READ = 'src/facebook/group/read/client.ts'
const POLL = 'src/cli/poll/index.ts'
const READ_COMMAND = 'src/cli/read/index.ts'
const PLAN = 'src/facebook/group/members/helpers/membersPlan.ts'
const EXTRACT = 'src/facebook/group/members/helpers/extractMembers.ts'
const MACHINE = 'src/facebook/group/members/machine.ts'
const MEMBERS = 'src/facebook/group/members/client.ts'
const STATES = 'src/browser/flow/helpers/pageState.ts'

const AUTH_CODES = ['checkpointed', 'loginWall', 'videoSelfieRequired', 'sessionExpired', 'neverConnected']

const anchors: RequirementAnchors = {
  'REQ-GROUP-01': [
    { kind: 'symbol', file: WORKER, name: 'parseWorkerRequest' },
    { kind: 'symbol', file: WORKER, name: 'recordsOf' },
    { kind: 'value', file: WORKER, name: 'WORKER_DEFAULT_LIMIT', equals: 20 },
    { kind: 'value', file: WORKER, name: 'WORKER_MAX_LIMIT', equals: 100 },
    { kind: 'string', file: WORKER, includes: 'groups.search' },
  ],
  'REQ-GROUP-02': [
    { kind: 'symbol', file: POLL, name: 'pollRequest' },
    { kind: 'symbol', file: READ_COMMAND, name: 'readInBrowser' },
    { kind: 'string', file: POLL, includes: 'groupNoAccount' },
    { kind: 'string', file: POLL, includes: 'groupBrowserNotOpen' },
    { kind: 'string', file: POLL, includes: 'MEMBER' },
  ],
  'REQ-GROUP-03': [
    { kind: 'symbol', file: POLL, name: 'pollOnce' },
  ],
  'REQ-GROUP-04': [
    { kind: 'symbol', file: WORKER, name: 'workerCodeOf' },
    { kind: 'string', file: WORKER, includes: 'auth_required' },
    ...AUTH_CODES.map((code) => ({ kind: 'string' as const, file: WORKER, includes: code })),
  ],
  'REQ-GROUP-05': [
    { kind: 'symbol', file: READ, name: 'saveRead' },
    { kind: 'string', file: READ, includes: 'agencyGroups' },
  ],
  'REQ-GROUP-06': [
    { kind: 'symbol', file: READ, name: 'saveRead' },
  ],
  'REQ-GROUP-07': [
    { kind: 'symbol', file: MACHINE, name: 'membersReadMachine' },
    { kind: 'symbol', file: MACHINE, name: 'MEMBERS_SCROLL_STEP' },
  ],
  'REQ-GROUP-08': [
    { kind: 'value', file: EXTRACT, name: 'MEMBERS_REFETCH_QUERY', equals: 'GroupsCometMembersPageNewMembersSectionRefetchQuery' },
    { kind: 'symbol', file: EXTRACT, name: 'memberPagesOf' },
    { kind: 'symbol', file: EXTRACT, name: 'membersFromPage' },
    { kind: 'symbol', file: EXTRACT, name: 'membersFromRefetch' },
    { kind: 'symbol', file: EXTRACT, name: 'memberOf' },
  ],
  'REQ-GROUP-09': [
    { kind: 'symbol', file: PLAN, name: 'planLine' },
    { kind: 'symbol', file: PLAN, name: 'scrollsFor' },
    { kind: 'value', file: PLAN, name: 'MEMBERS_PER_PAGE', equals: 10 },
    { kind: 'value', file: PLAN, name: 'PAGES_PER_SCROLL', equals: 2 },
  ],
  'REQ-GROUP-10': [
    { kind: 'value', file: PLAN, name: 'DEFAULT_SECONDS_PER_SCROLL', equals: 15 },
  ],
  'REQ-GROUP-11': [
    { kind: 'symbol', file: PLAN, name: 'stopOf' },
    { kind: 'symbol', file: PLAN, name: 'defaultMaxScrolls' },
  ],
  'REQ-GROUP-12': [
    { kind: 'symbol', file: PLAN, name: 'OWNER_BIO' },
    { kind: 'symbol', file: PLAN, name: 'ownerReasonOf' },
  ],
  'REQ-GROUP-13': [
    { kind: 'symbol', file: MEMBERS, name: 'saveMembers' },
    { kind: 'symbol', file: MEMBERS, name: 'membersDirOf' },
    { kind: 'string', file: MEMBERS, includes: '.logCli' },
    { kind: 'string', file: MEMBERS, includes: 'members' },
  ],
  'REQ-GROUP-14': [
    { kind: 'string', file: STATES, includes: 'groupMembersList' },
  ],
}

export const facebookGroups = {
  description: 'Facebook group listening through the OpenMagpie poll worker, and reading the members of a group',
  specPath: 'docs/specs/facebookGroups.md',
  codePaths: [
    WORKER,
    READ,
    POLL,
    READ_COMMAND,
    PLAN,
    EXTRACT,
    MACHINE,
    MEMBERS,
    STATES,
  ],
  anchors,
  rubrics: {
    'REQ-GROUP-01': noul('Does parseWorkerRequest refuse any action other than groups.search, an empty or non-numeric group id and text that is not JSON, default the limit to WORKER_DEFAULT_LIMIT and cap it at WORKER_MAX_LIMIT, and does pollRequest print one JSON answer whose results are recordsOf records (record_id, group_id, content, url, author, occurred_at, metrics, matched_terms)?'),
    'REQ-GROUP-02': noul('In the loop of pollRequest over the agencyGroups rows (MEMBER first), is a candidate account taken only when both checkRunnable(candidate) is ok and readCurrentInspect(undefined, candidate.accountName) returns an open session, with groupNoAccount when there is no row, groupBrowserNotOpen when no candidate passes, and the read done through readInBrowser rather than by launching a browser?'),
    'REQ-GROUP-03': noul('Does pollOnce call readInBrowser with commentPosts 0 and live false?'),
    'REQ-GROUP-04': noul('Does workerCodeOf return auth_required for checkpointed, loginWall, videoSelfieRequired, sessionExpired and neverConnected, and every other code unchanged?'),
    'REQ-GROUP-05': noul('Does saveRead write to the agencyGroups row only readCursor, lastReadAt, lastReadReason, and facebookGroupId with groupUrl when the numeric id was found, and does no group read code write posts or comments to Twenty?'),
    'REQ-GROUP-06': noul('Does saveRead set readCursor only when output.feedDone is true, while setting lastReadAt and lastReadReason on every read?'),
    'REQ-GROUP-07': noul('Does membersReadMachine send only a goto to the membersUrl of the group and then MEMBERS_SCROLL_STEP scroll steps, with no click action?'),
    'REQ-GROUP-08': noul('Does memberPagesOf read members from the page documents with membersFromPage and from every MEMBERS_REFETCH_QUERY answer with membersFromRefetch, and does memberOf keep id, name, url, bio, category, followers and joined?'),
    'REQ-GROUP-09': noul('Does planLine print the count, then about how many scrolls, then about how many minutes at the seconds per scroll, with scrollsFor computing the scrolls past the first MEMBERS_PER_PAGE members at MEMBERS_PER_PAGE times PAGES_PER_SCROLL a scroll, and does the members read print that line before the machine starts?'),
    'REQ-GROUP-10': noul('Does membersReadMachine wait plan.secondsPerScroll seconds before each scroll, with secondsPerScroll taken from --secondsPerScroll and DEFAULT_SECONDS_PER_SCROLL when the flag is not given?'),
    'REQ-GROUP-11': noul('Does stopOf stop at count members, at hasNextPage false, and at maxScrolls, with defaultMaxScrolls twice the planned scrolls plus 2?'),
    'REQ-GROUP-12': noul('With --owners, are only members kept for whom ownerReasonOf finds OWNER_BIO (owner, co-owner, founder, ceo, president, proprietor, self-employed) in the bio or a category set?'),
    'REQ-GROUP-13': noul('Does saveMembers write a .tsv and a .json named by the run time under membersDirOf() and the group, and is nothing about the members written to Twenty?'),
    'REQ-GROUP-14': noul('Is groupMembersList a known page state with needsNothing true, matched on a /groups/<g>/members URL whose refetch answered with members, with no resolver to run?'),
    unspecifiedBehavior: noul('Does the group listening or members code write posts, comments or members to Twenty, click on the page, or open a browser of its own, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-GROUP-01': MET,
    'REQ-GROUP-02': MET,
    'REQ-GROUP-03': MET,
    'REQ-GROUP-04': MET,
    'REQ-GROUP-05': MET,
    'REQ-GROUP-06': MET,
    'REQ-GROUP-07': MET,
    'REQ-GROUP-08': MET,
    'REQ-GROUP-09': MET,
    'REQ-GROUP-10': MET,
    'REQ-GROUP-11': MET,
    'REQ-GROUP-12': MET,
    'REQ-GROUP-13': MET,
    'REQ-GROUP-14': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
