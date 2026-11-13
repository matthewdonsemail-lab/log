export type NumberedKind = 'userId' | 'actorId' | 'accountId' | 'id' | 'name' | 'username'

export type FixedKind = 'password' | 'csrfToken' | 'cookie' | 'token' | 'email' | 'phone' | 'messageText'

export type KeyKind = NumberedKind | FixedKind

export interface Redactor {
  redact: (text: string) => string
}
