import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CLIENT = 'src/extensions/fishAudio/client.ts'
const RECORDINGS = 'src/extensions/fishAudio/helpers/recordings.ts'
const VOICE_NOTE = 'src/extensions/fishAudio/helpers/voiceNote.ts'
const AUDIO = 'src/extensions/fishAudio/helpers/audio.ts'
const FISH = 'src/cli/fish/index.ts'
const SENDS = 'src/cli/voiceNote/index.ts'
const MEDIA = 'python/platformKit/media.py'
const DISCORD = 'python/discordApi/engine.py'
const INSTAGRAM = 'python/instagramApi/engine.py'
const SLACK = 'python/slackApi/engine.py'

export const fishVoice = {
  description: "matt's voice cloned once on Fish Audio from his own voice notes, and voice notes in it sent natively on Discord, Instagram and Slack only when he asks",
  specPath: 'docs/specs/fishVoice.md',
  codePaths: [CLIENT, RECORDINGS, VOICE_NOTE, AUDIO, FISH, SENDS, MEDIA, DISCORD, INSTAGRAM, SLACK, 'src/extensions/fishAudio/types.ts', 'src/cli/runner/helpers/commandIndex.ts'],
  anchors: {
    'REQ-FISH-01': [
      { kind: 'symbol', file: CLIENT, name: 'createFishClient' },
      { kind: 'symbol', file: CLIENT, name: 'fishKey' },
      { kind: 'string', file: CLIENT, includes: 'fishKeyMissing' },
    ],
    'REQ-FISH-02': [
      { kind: 'symbol', file: RECORDINGS, name: 'mattsRecordings' },
      { kind: 'symbol', file: RECORDINGS, name: 'sentByMatt' },
      { kind: 'symbol', file: RECORDINGS, name: 'pickReferences' },
      { kind: 'symbol', file: FISH, name: 'fishCommand' },
      { kind: 'string', file: FISH, includes: 'voiceRecordingsMissing' },
    ],
    'REQ-FISH-03': [
      { kind: 'symbol', file: VOICE_NOTE, name: 'speakToFile' },
      { kind: 'symbol', file: VOICE_NOTE, name: 'textOnlyProblem' },
    ],
    'REQ-FISH-04': [
      { kind: 'symbol', file: SENDS, name: 'voiceNoteCommandOf' },
      { kind: 'symbol', file: SENDS, name: 'discordVoiceCommand' },
      { kind: 'symbol', file: SENDS, name: 'instagramVoiceCommand' },
      { kind: 'symbol', file: SENDS, name: 'slackVoiceCommand' },
    ],
    'REQ-FISH-05': [
      { kind: 'symbol', file: VOICE_NOTE, name: 'renderVoiceNote' },
      { kind: 'symbol', file: AUDIO, name: 'convertFor' },
      { kind: 'string', file: SENDS, includes: 'chatClaimedElsewhere' },
      { kind: 'string', file: SENDS, includes: 'voiceGateFailed' },
    ],
    'REQ-FISH-06': [
      { kind: 'symbol', file: MEDIA, name: 'voice_note_path' },
      { kind: 'symbol', file: DISCORD, name: 'voice_of' },
      { kind: 'symbol', file: INSTAGRAM, name: 'voice_sync' },
      { kind: 'symbol', file: INSTAGRAM, name: 'curl_voice_rupload' },
      { kind: 'symbol', file: SLACK, name: 'voice' },
    ],
    'REQ-FISH-07': [
      { kind: 'string', file: 'src/cli/runner/helpers/commandIndex.ts', includes: 'discordVoiceCommand' },
    ],
  },
  rubrics: {
    'REQ-FISH-01': noul('In src/extensions/fishAudio/client.ts, does createFishClient call only POST /model as multipart with type tts, title, train_mode fast, visibility private and the voices files and read _id, GET /model/{id}, and POST /v1/tts with JSON text, reference_id and format and a model header, each with the FISH_API_KEY as a bearer token, and answer fishKeyMissing without sending anything when there is no key?'),
    'REQ-FISH-02': noul('In src/extensions/fishAudio/helpers/recordings.ts and src/cli/fish/index.ts, does mattsRecordings keep only recordings sentByMatt says he sent (fromMe true in the conversation store, or an ownMessage event with that id in the .db), does pickReferences take them shortest first between 5 and 60 seconds each and at most 60 seconds in all, and does fishCommand clone list them without --apply, refuse under 10 seconds with voiceRecordingsMissing, call createModel only with --apply, and never make a second model when readClone already has one?'),
    'REQ-FISH-03': noul('In src/extensions/fishAudio/helpers/voiceNote.ts, does speakToFile refuse with voiceCloneMissing when there is no clone and with voiceNoteInvalid when textOnlyProblem finds the text empty, too long, an audio file name or an existing path, speak with the clone model (s2.1-pro-free unless a model is given), and write the audio under voiceNotesDir?'),
    'REQ-FISH-04': noul('In src/cli/voiceNote/index.ts, are discordVoiceCommand, instagramVoiceCommand and slackVoiceCommand all made by voiceNoteCommandOf, which has no flag for an audio file, refuses text that textOnlyProblem rejects as voiceNoteInvalid, returns a dry run without --live that calls neither render nor the engine, and refuses --live without --approvedBy as notApproved?'),
    'REQ-FISH-05': noul('With --live, does voiceNoteCommandOf in src/cli/voiceNote/index.ts refuse without a clone, call waitCaughtUp, then gateDeps.gate and refuse voiceGateFailed, then render the note (renderVoiceNote speaking it and convertFor converting it with ffmpeg), and only after that call guardSend, refuse chatClaimedElsewhere when it is not ok, call the resolved engine send with the voice action, and call guard.done with sent or failed?'),
    'REQ-FISH-06': noul('Is voice in WRITES of python/discordApi/engine.py, python/instagramApi/engine.py and python/slackApi/engine.py; does each voice action take its file only through voice_note_path in python/platformKit/media.py (right suffix, non-empty, under the voiceNotes folder) and refuse voiceNoteInvalid otherwise; does voice_of request an upload slot, upload, and post the message with media.DISCORD_VOICE_FLAG, duration_secs and waveform; does voice_sync run under locked and bind curl_voice_rupload before direct_send_voice; and does the Slack voice call files.getUploadURLExternal, fetch_authenticated and files.completeUploadExternal, returning voiceNoteRefused on any refusal without retrying?'),
    'REQ-FISH-07': noul('In COMMAND_INDEX in src/cli/runner/helpers/commandIndex.ts, are there entries named voice with platform discord (discordVoiceCommand), slack (slackVoiceCommand) and instagram (instagramVoiceCommand), all with module src/cli/voiceNote/index.ts, and is there no entry named voice with platform twitter (the voice entry with platform any is the voice gate, voiceCommand, not a voice note)?'),
    unspecifiedBehavior: noul('Does any fish or voice command send an audio file the caller gave, send a voice note without live and approvedBy, retry a refused voice note, clone a voice from recordings matt did not send, or send through a browser, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-FISH-01': MET,
    'REQ-FISH-02': MET,
    'REQ-FISH-03': MET,
    'REQ-FISH-04': MET,
    'REQ-FISH-05': MET,
    'REQ-FISH-06': MET,
    'REQ-FISH-07': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
