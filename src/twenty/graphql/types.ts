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

export interface TwentyObjects {
  socialAccounts: { row: SocialAccount; filter: SocialAccountFilterInput; create: SocialAccountCreateInput; update: SocialAccountUpdateInput }
  agencyListings: { row: AgencyListing; filter: AgencyListingFilterInput; create: AgencyListingCreateInput; update: AgencyListingUpdateInput }
  agencyConversations: { row: AgencyConversation; filter: AgencyConversationFilterInput; create: AgencyConversationCreateInput; update: AgencyConversationUpdateInput }
  agencyMessages: { row: AgencyMessage; filter: AgencyMessageFilterInput; create: AgencyMessageCreateInput; update: AgencyMessageUpdateInput }
  agencyGroups: { row: AgencyGroup; filter: AgencyGroupFilterInput; create: AgencyGroupCreateInput; update: AgencyGroupUpdateInput }
  agencyGroupPosts: { row: AgencyGroupPost; filter: AgencyGroupPostFilterInput; create: AgencyGroupPostCreateInput; update: AgencyGroupPostUpdateInput }
  agencyGroupComments: { row: AgencyGroupComment; filter: AgencyGroupCommentFilterInput; create: AgencyGroupCommentCreateInput; update: AgencyGroupCommentUpdateInput }
}

export type TwentyObject = keyof TwentyObjects

export interface TwentyClient {
  list<K extends TwentyObject>(object: K, filter?: TwentyObjects[K]['filter']): Promise<TwentyObjects[K]['row'][]>
  get<K extends TwentyObject>(object: K, id: string): Promise<TwentyObjects[K]['row'] | null>
  create<K extends TwentyObject>(object: K, data: TwentyObjects[K]['create']): Promise<TwentyObjects[K]['row']>
  update<K extends TwentyObject>(object: K, id: string, data: TwentyObjects[K]['update']): Promise<TwentyObjects[K]['row']>
  loginSecrets(accountId: string): Promise<LoginSecrets | null>
}

export interface LoginSecrets {
  email: string | null
  password: string | null
  totpSecret: string | null
  messengerPin: string | null
}

export class TwentyError extends Error {
  readonly code: ErrorCode
  readonly status: number | null

  constructor(code: ErrorCode, message: string, status: number | null = null) {
    super(message)
    this.code = code
    this.status = status
  }
}
