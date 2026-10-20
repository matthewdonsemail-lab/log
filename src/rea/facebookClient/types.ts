/**
 * The Facebook client map: every request Facebook's pages made in our runs,
 * sorted by domain, joined to the module in Facebook's own bundles that
 * defines it, and read by rea one small slice at a time. It is the basis of
 * `docs/platforms/facebook/` (one doc per request) and the AGENTS.md loop: a run
 * that fails or hangs is explained from its recording (rule 25).
 */

/** One `__d("Name", [deps], factory)` module from Facebook's bundles, cut out by the syntax tree. */
export interface FacebookModule {
  name: string
  deps: string[]
  /** The module's whole statement, as Facebook served it. */
  text: string
}

/**
 * Where a request belongs on its platform. The docs are platform first, then domain
 * (`docs/platforms/<platform>/<domain>/<request>.md`, Facebook: `docs/platforms/facebook/`), so a new
 * platform explored with `log inspect` gets a folder of its own beside Facebook's.
 */
export type ClientDomain = 'login' | 'checkpoint' | 'groups' | 'reels' | 'listingForm' | 'location' | 'photos' | 'publishing' | 'profile' | 'background'

/** The platform these docs and this client map are for. */
export const PLATFORM = 'facebook'

/** GraphQL operations carry their kind in their `.graphql` module; other POSTs are `endpoint`. */
export type OperationKind = 'query' | 'mutation' | 'subscription' | 'endpoint'

/**
 * One time a request was made in a run. Names, timings and statuses only:
 * variable values, cookies and tokens stay in the raw HAR (rule 19), so
 * this can be committed in the docs.
 */
export interface OperationSighting {
  /** The run folder's name, e.g. `20261019T091935_61593993818791`. */
  run: string
  /** `connect`, `publish`, `scan`... */
  action: string
  /** Our log line that was running when the request started (`steps.jsonl`). */
  step: string
  status: number
  /** How long the request took. */
  ms: number
  /** From the start of our step to the request starting: how fast Facebook's page reacted to us. */
  afterStepMs: number
  /** `errors[].message` / `errorSummary` from the response, if any. */
  errors: string[]
}

/** What a `.graphql` module says about its operation, read from its syntax tree. */
export interface GraphqlDefinition {
  kind: OperationKind | null
  /** The variables it takes (`categoryID`). */
  sends: string[]
  /** The fields it reads, two levels deep (`viewer.marketplace_composer_attribute_definitions`). */
  reads: string[]
}

export interface ClientOperation {
  name: string
  domain: ClientDomain
  kind: OperationKind
  /** GraphQL `doc_id`, the persisted query id; null for endpoints. */
  docId: string | null
  /** `/api/graphql/` or the endpoint's path. */
  path: string
  sends: string[]
  reads: string[]
  /** Facebook modules that import this operation: the component or hook that fires it. */
  calledFrom: string[]
  sightings: OperationSighting[]
  /** rea's Evidence for this operation's slice, or null when rea was not run on it. */
  reaEvidenceId: string | null
}
