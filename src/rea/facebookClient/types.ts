export interface FacebookModule {
  name: string
  deps: string[]
  text: string
}

export type ClientDomain = 'login' | 'checkpoint' | 'groups' | 'reels' | 'listingForm' | 'location' | 'photos' | 'publishing' | 'profile' | 'background'

export const PLATFORM = 'facebook'

export type OperationKind = 'query' | 'mutation' | 'subscription' | 'endpoint'

export interface OperationSighting {
  run: string
  action: string
  step: string
  status: number
  ms: number
  afterStepMs: number
  errors: string[]
  sent?: unknown
  answer?: unknown
}

export interface OperationSample {
  run: string
  step: string
  status: number
  ms: number
  sent: unknown
  answer: unknown
}

export interface GraphqlDefinition {
  kind: OperationKind | null
  sends: string[]
  reads: string[]
}

export interface ClientOperation {
  name: string
  domain: ClientDomain
  kind: OperationKind
  docId: string | null
  path: string
  sends: string[]
  reads: string[]
  calledFrom: string[]
  sightings: OperationSighting[]
  reaEvidenceId: string | null
}
