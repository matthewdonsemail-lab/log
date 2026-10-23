import type { CodedFailure, ErrorCode } from '../../errors/catalog/index'
import type { ConnectPageKind } from '../connect/index'

export interface ProfilePage {
  kind: ConnectPageKind
  path: string
  profileControl: string | null
  coverControl: string | null
  fileInputs: number
  controls: number
}

export type ProfileReadOutput = ({ ok: true } & ProfilePage) | CodedFailure
export type ProfileActOutput = { ok: true } | CodedFailure
export interface ProfileNamePage {
  path: string
  currentName: string | null
  fields: string[]
  controls: number
}
export type ProfileNameOutput = ({ ok: true } & ProfileNamePage) | CodedFailure
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
  live: boolean
  hasProfilePhoto: boolean
  hasCoverPhoto: boolean
  profileName: string | null
}

export type ProfileItem = 'profilePhoto' | 'coverPhoto' | 'name'

export interface ProfilePlanStep {
  item: ProfileItem
  control: string | null
  current?: string | null
  wanted?: string | null
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
