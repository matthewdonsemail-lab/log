export interface MirrorMessage {
  time?: string | null
  at?: string | null
  fromMe?: boolean
  from?: string | null
  text?: string | null
}

export const MIRROR_SECONDS = 5

export const ONE_INBOX_NOTE = "An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox."
