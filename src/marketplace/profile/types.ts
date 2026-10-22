/**
 * Setting one account's profile picture and cover photo (`log facebook profile setup`,
 * rule 28), as an XState machine. Listaro's own warm-up guide does this on
 * days 1-2 of an account (Listaro_backup content/blog/
 * how-to-post-without-getting-banned.md): a real-looking profile photo and a
 * cover photo. A dry run (the default) reads the profile and says what it
 * would do; `--live` uploads both in the one run. Every browser step is an
 * actor the caller provides; tests never open a browser.
 */
import type { CodedFailure, ErrorCode } from '../../errors/catalog/index'
import type { ConnectPageKind } from '../connect/index'

/** What `profileSession.py` `read` found on the account's own profile. */
export interface ProfilePage {
  kind: ConnectPageKind
  /** The URL without its query. */
  path: string
  /** The name of the profile picture's opener ("Update profile picture"), or null when none was found. */
  profileControl: string | null
  /** The cover's opener: "Add cover photo" (none yet) or "Edit cover photo", or null. */
  coverControl: string | null
  fileInputs: number
  /** How many controls the page had, all listed in the run's profileFound.txt. */
  controls: number
}

export type ProfileReadOutput = ({ ok: true } & ProfilePage) | CodedFailure
export type ProfileActOutput = { ok: true } | CodedFailure
/** The name settings page (Accounts Center), read only: its fields and the name it shows. */
export interface ProfileNamePage {
  path: string
  currentName: string | null
  /** The name fields' labels ("First name", "Surname"...), as the page names them. */
  fields: string[]
  controls: number
}
export type ProfileNameOutput = ({ ok: true } & ProfileNamePage) | CodedFailure
/** Both photos, varied and fetched through the account's proxy (`media/photo`), ready to upload. */
export type ProfilePhotosOutput = { ok: true; profilePath: string; coverPath: string } | CodedFailure

export interface ProfileActorInputs {
  preparePhotos: undefined
  open: undefined
  read: undefined
  readName: undefined
  uploadProfilePhoto: { path: string }
  uploadCoverPhoto: { path: string }
}

export interface ProfileInput {
  accountId: string
  /** `--live`: upload. Without it nothing on Facebook changes (rule 8). */
  live: boolean
  /** socialAccounts.profilePhoto and coverPhoto are set in Twenty. */
  hasProfilePhoto: boolean
  hasCoverPhoto: boolean
  /** socialAccounts.profileName: the name matt wants on the profile, or null. */
  profileName: string | null
}

export type ProfileItem = 'profilePhoto' | 'coverPhoto' | 'name'

export interface ProfilePlanStep {
  item: ProfileItem
  /** The control the page offers for it, or null. */
  control: string | null
  /** For the name: what the profile is called now, and what Twenty wants. */
  current?: string | null
  wanted?: string | null
  /** The rename itself is not built yet: the dry run reads the name page so it can be (rule 25). */
  action: 'wouldUpload' | 'uploaded' | 'noPhotoInTwenty' | 'noControl' | 'wouldRename' | 'alreadyNamed' | 'noNameInTwenty' | 'renameNotBuilt'
}

export interface ProfileFailure {
  state: string
  code: ErrorCode
  detail?: string
}

export type ProfileResultKind = 'planned' | 'saved' | 'failed'

export interface ProfileContext extends ProfileInput {
  photos: { profilePath: string; coverPath: string } | null
  page: ProfilePage | null
  namePage: ProfileNamePage | null
  uploaded: ProfileItem[]
  failure: ProfileFailure | null
  result: ProfileResultKind | null
}

export interface ProfileOutput {
  accountId: string
  live: boolean
  result: ProfileResultKind
  page: ProfilePage | null
  namePage: ProfileNamePage | null
  plan: ProfilePlanStep[]
  failure: ProfileFailure | null
}
