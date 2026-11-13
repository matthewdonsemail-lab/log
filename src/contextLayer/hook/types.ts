export interface HookInput {
  hook_event_name?: string
  prompt?: string
  source?: string
  session_id?: string
  transcript_path?: string
}

export interface HookResult {
  event: string
  text: string
  outcome: string
  menu?: string[]
}
