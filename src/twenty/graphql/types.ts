/**
 * Twenty, through the generated GraphQL client (`generated/`, emitted by
 * `bun run twenty:client` the same way blaster and the dialer emit theirs).
 * log-cli's accounts (socialAccounts) and listings (agencyListings) live
 * there and nowhere else (matt, 2026-10-18).
 *
 * `TwentyClient` is the seam the marketplace domains use: record CRUD with
 * the generated row, filter and input types. The live one is `client.ts`;
 * tests use `helpers/memoryTwenty.ts`.
 */
import type { ErrorCode } from '../../errors/catalog/index'
import type {
  AgencyConversation,
  AgencyConversationCreateInput,
  AgencyConversationFilterInput,
  AgencyConversationUpdateInput,
  AgencyGroup,
  AgencyGroupCreateInput,
  AgencyGroupFilterInput,
  AgencyGroupUpdateInput,
  AgencyGroupComment,
  AgencyGroupCommentCreateInput,
  AgencyGroupCommentFilterInput,
  AgencyGroupCommentUpdateInput,
  AgencyGroupPost,
  AgencyGroupPostCreateInput,
  AgencyGroupPostFilterInput,
  AgencyGroupPostUpdateInput,
  AgencyListing,
  AgencyListingCreateInput,
  AgencyListingFilterInput,
  AgencyListingUpdateInput,
  AgencyMessage,
  AgencyMessageCreateInput,
  AgencyMessageFilterInput,
  AgencyMessageUpdateInput,
  SocialAccount,
  SocialAccountCreateInput,
  SocialAccountFilterInput,
  SocialAccountUpdateInput
} from './generated/index'

/** The objects log-cli reads and writes, with their generated types. */
export interface TwentyObjects {
  socialAccounts: { row: SocialAccount; filter: SocialAccountFilterInput; create: SocialAccountCreateInput; update: SocialAccountUpdateInput }
  agencyListings: { row: AgencyListing; filter: AgencyListingFilterInput; create: AgencyListingCreateInput; update: AgencyListingUpdateInput }
  /** A buyer's conversation about a listing (rule 34), and its messages. Shared with blaster's SMS threads. */
  agencyConversations: { row: AgencyConversation; filter: AgencyConversationFilterInput; create: AgencyConversationCreateInput; update: AgencyConversationUpdateInput }
  agencyMessages: { row: AgencyMessage; filter: AgencyMessageFilterInput; create: AgencyMessageCreateInput; update: AgencyMessageUpdateInput }
  /** A Facebook group on one account (rule 45): where the account stands with it. */
  agencyGroups: { row: AgencyGroup; filter: AgencyGroupFilterInput; create: AgencyGroupCreateInput; update: AgencyGroupUpdateInput }
  /** A post in a group row, and its comments (`log facebook read group`, #27). */
  agencyGroupPosts: { row: AgencyGroupPost; filter: AgencyGroupPostFilterInput; create: AgencyGroupPostCreateInput; update: AgencyGroupPostUpdateInput }
  agencyGroupComments: { row: AgencyGroupComment; filter: AgencyGroupCommentFilterInput; create: AgencyGroupCommentCreateInput; update: AgencyGroupCommentUpdateInput }
}

export type TwentyObject = keyof TwentyObjects

export interface TwentyClient {
  /** Every record matching the filter, across all pages. */
  list<K extends TwentyObject>(object: K, filter?: TwentyObjects[K]['filter']): Promise<TwentyObjects[K]['row'][]>
  get<K extends TwentyObject>(object: K, id: string): Promise<TwentyObjects[K]['row'] | null>
  create<K extends TwentyObject>(object: K, data: TwentyObjects[K]['create']): Promise<TwentyObjects[K]['row']>
  update<K extends TwentyObject>(object: K, id: string, data: TwentyObjects[K]['update']): Promise<TwentyObjects[K]['row']>
  /**
   * The account's sign-in details, for `log facebook connect`'s auto-login only. The
   * one read of these fields: they go to the run's private temp folder for
   * the worker, never into a row, an output or a log.
   */
  loginSecrets(accountId: string): Promise<LoginSecrets | null>
}

/** What auto-login types into Facebook. Credentials: never print them. */
export interface LoginSecrets {
  email: string | null
  password: string | null
  totpSecret: string | null
}

/** A Twenty call that failed, with its catalog code. */
export class TwentyError extends Error {
  readonly code: ErrorCode
  readonly status: number | null

  constructor(code: ErrorCode, message: string, status: number | null = null) {
    super(message)
    this.code = code
    this.status = status
  }
}
