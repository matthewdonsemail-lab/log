import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SHARED = 'src/extensions/voiceClone/client.ts'
const PROVIDER = 'src/extensions/voiceClone/helpers/provider.ts'
const RECORDINGS = 'src/extensions/voiceClone/helpers/recordings.ts'
const VOICE_NOTE = 'src/extensions/voiceClone/helpers/voiceNote.ts'
const AUDIO = 'src/extensions/voiceClone/helpers/audio.ts'
const STORE = 'src/extensions/voiceClone/helpers/store.ts'
const INWORLD = 'src/extensions/inworld/client.ts'
const FISH = 'src/extensions/fishAudio/client.ts'
const CLONE = 'src/cli/clone/index.ts'
const SENDS = 'src/cli/voiceNote/index.ts'
const RETIRED = 'src/cli/runner/helpers/retired.ts'
const MEDIA = 'python/platformKit/media.py'
const DISCORD = 'python/discordApi/engine.py'
const INSTAGRAM = 'python/instagramApi/engine.py'
const SLACK = 'python/slackApi/engine.py'
const INDEX = 'src/cli/runner/helpers/commandIndex.ts'

export const voiceClone = {
  description: "matt's voice cloned once per provider (Inworld or Fish Audio) from his own voice notes, and voice notes in it sent natively on Discord, Instagram and Slack only when he asks",
  specPath: 'docs/specs/voiceClone.md',
  codePaths: [SHARED, PROVIDER, RECORDINGS, VOICE_NOTE, AUDIO, STORE, INWORLD, FISH, CLONE, SENDS, RETIRED, MEDIA, DISCORD, INSTAGRAM, SLACK, INDEX, 'src/extensions/voiceClone/types.ts', 'src/extensions/inworld/types.ts', 'src/extensions/fishAudio/types.ts'],
  anchors: {
    'REQ-VOICE-CLONE-01': [
      { kind: 'symbol', file: SHARED, name: 'voiceProvider' },
      { kind: 'symbol', file: SHARED, name: 'PROVIDER_CLIENTS' },
      { kind: 'symbol', file: PROVIDER, name: 'providerOf' },
    ],
    'REQ-VOICE-CLONE-02': [
      { kind: 'symbol', file: INWORLD, name: 'createInworldClient' },
      { kind: 'symbol', file: INWORLD, name: 'inworldProvider' },
    ],
    'REQ-VOICE-CLONE-03': [
      { kind: 'symbol', file: FISH, name: 'createFishClient' },
      { kind: 'symbol', file: FISH, name: 'fishAudioProvider' },
    ],
    'REQ-VOICE-CLONE-04': [
      { kind: 'symbol', file: RECORDINGS, name: 'mattsRecordings' },
      { kind: 'symbol', file: RECORDINGS, name: 'sentByMatt' },
      { kind: 'symbol', file: RECORDINGS, name: 'pickReferences' },
      { kind: 'symbol', file: CLONE, name: 'cloneCommand' },
      { kind: 'symbol', file: RETIRED, name: 'RETIRED_COMMANDS' },
    ],
    'REQ-VOICE-CLONE-05': [
      { kind: 'symbol', file: VOICE_NOTE, name: 'speakToFile' },
      { kind: 'symbol', file: VOICE_NOTE, name: 'textOnlyProblem' },
    ],
    'REQ-VOICE-CLONE-06': [
      { kind: 'symbol', file: SENDS, name: 'voiceNoteCommandOf' },
      { kind: 'symbol', file: SENDS, name: 'discordVoiceCommand' },
      { kind: 'symbol', file: SENDS, name: 'instagramVoiceCommand' },
      { kind: 'symbol', file: SENDS, name: 'slackVoiceCommand' },
    ],
    'REQ-VOICE-CLONE-07': [
      { kind: 'symbol', file: VOICE_NOTE, name: 'renderVoiceNote' },
      { kind: 'symbol', file: AUDIO, name: 'convertFor' },
      { kind: 'string', file: SENDS, includes: 'chatClaimedElsewhere' },
      { kind: 'string', file: SENDS, includes: 'voiceGateFailed' },
    ],
    'REQ-VOICE-CLONE-08': [
      { kind: 'symbol', file: MEDIA, name: 'voice_note_path' },
      { kind: 'symbol', file: DISCORD, name: 'voice_of' },
      { kind: 'symbol', file: INSTAGRAM, name: 'voice_sync' },
      { kind: 'symbol', file: INSTAGRAM, name: 'curl_voice_rupload' },
      { kind: 'symbol', file: SLACK, name: 'voice' },
    ],
    'REQ-VOICE-CLONE-09': [
      { kind: 'string', file: INDEX, includes: 'discordVoiceCommand' },
    ],
    'REQ-VOICE-CLONE-10': [
      { kind: 'string', file: SENDS, includes: 'mattsWords' },
      { kind: 'string', file: SENDS, includes: 'the AI artifact check passed' },
      { kind: 'string', file: SENDS, includes: 'aiArtifacts' },
    ],
  },
  rubrics: {
    'REQ-VOICE-CLONE-01': noul('In src/extensions/voiceClone/client.ts and src/extensions/voiceClone/helpers/provider.ts, does voiceProvider return the provider client from PROVIDER_CLIENTS (inworld and fishAudio), does providerOf pick --provider, else LOG_VOICE_PROVIDER, else inworld and refuse any other name, and do src/cli/clone/index.ts and src/cli/voiceNote/index.ts import only from src/extensions/voiceClone, never from src/extensions/inworld or src/extensions/fishAudio?'),
    'REQ-VOICE-CLONE-02': noul('In src/extensions/inworld/client.ts, does createInworldClient call only POST /voices/v1/voices:clone with displayName, languageCode and voiceSamples of base64 audioData and read voice.voiceId, and POST /tts/v1/voice with text, voiceId, modelId and audioConfig.audioEncoding and read base64 audioContent, both with Authorization Basic and the INWORLD_API_KEY, answering voiceKeyMissing without a key; and does inworldProvider say wav references, limits 3 to 30 s and cheapest inworld-tts-2-flash?'),
    'REQ-VOICE-CLONE-03': noul('In src/extensions/fishAudio/client.ts, does createFishClient call only POST /model as multipart with type tts, title, train_mode fast, visibility private and the voices files and read _id, GET /model/{id}, and POST /v1/tts with JSON text, reference_id and format and a model header, with FISH_API_KEY as a bearer token; and does fishAudioProvider say references as they are, limits 10 to 60 s and cheapest s2.1-pro-free?'),
    'REQ-VOICE-CLONE-04': noul('In src/extensions/voiceClone/helpers/recordings.ts and src/cli/clone/index.ts, does mattsRecordings keep only recordings sentByMatt says he sent (fromMe true in the conversation store, or an ownMessage event in the .db), does pickReferences take them shortest first, at least 5 s each, within the provider most, and does cloneCommand voice list them without --apply, refuse under the provider least with voiceRecordingsMissing, convert to wav with wavOf when the provider referenceFormat is wav, call the provider clone only with --apply, and never clone again when readClone already holds that provider; and does RETIRED_COMMANDS in src/cli/runner/helpers/retired.ts refuse log fish with the log clone form it became?'),
    'REQ-VOICE-CLONE-05': noul('In src/extensions/voiceClone/helpers/voiceNote.ts, does speakToFile refuse with voiceCloneMissing when the provider has no clone and with voiceNoteInvalid when textOnlyProblem finds the text empty, too long, an audio file name or an existing path, speak with the clone model unless a model is given, and write the audio under voiceNotesDir?'),
    'REQ-VOICE-CLONE-06': noul('In src/cli/voiceNote/index.ts, are discordVoiceCommand, instagramVoiceCommand and slackVoiceCommand all made by voiceNoteCommandOf, which has a provider flag and no flag for an audio file, refuses text that textOnlyProblem rejects as voiceNoteInvalid, returns a dry run without --live that calls neither render nor the engine, and refuses --live without --approvedBy as notApproved?'),
    'REQ-VOICE-CLONE-07': noul('With --live, does voiceNoteCommandOf in src/cli/voiceNote/index.ts refuse without a clone on the chosen provider, call waitCaughtUp, then, unless --mattsWords is set, gateDeps.gate and refuse voiceGateFailed, then render the note with that provider (renderVoiceNote speaking it and convertFor converting it with ffmpeg), and only after that call guardSend, refuse chatClaimedElsewhere when it is not ok, call the resolved engine send with the voice action, and call guard.done with sent or failed?'),
    'REQ-VOICE-CLONE-08': noul('Is voice in WRITES of python/discordApi/engine.py, python/instagramApi/engine.py and python/slackApi/engine.py; does each voice action take its file only through voice_note_path in python/platformKit/media.py (right suffix, non-empty, under the voiceNotes folder) and refuse voiceNoteInvalid otherwise; does voice_of request an upload slot, upload, and post the message with media.DISCORD_VOICE_FLAG, duration_secs and waveform; does voice_sync run under locked and bind curl_voice_rupload before direct_send_voice; and does the Slack voice call files.getUploadURLExternal, fetch_authenticated and files.completeUploadExternal, returning voiceNoteRefused on any refusal without retrying?'),
    'REQ-VOICE-CLONE-09': noul('In COMMAND_INDEX in src/cli/runner/helpers/commandIndex.ts, are there entries named voice with platform discord (discordVoiceCommand), slack (slackVoiceCommand) and instagram (instagramVoiceCommand), all with module src/cli/voiceNote/index.ts, and is there no entry named voice with platform twitter (the voice entry with platform any is the voice gate, voiceCommand, not a voice note)?'),
    'REQ-VOICE-CLONE-10': noul('In src/cli/voiceNote/index.ts, does voiceNoteCommandOf have a mattsWords boolean flag, and with it set does a live send skip gateDeps.gate entirely while still refusing aiArtifacts from watermarkReadingOf(text), which runs before the flag is looked at, and without it does a live send still call gateDeps.gate and refuse voiceGateFailed?'),
    unspecifiedBehavior: noul('Does any clone or voice command send an audio file the caller gave, send a voice note without live and approvedBy, retry a refused voice note, clone a voice from recordings matt did not send, call a provider directly from a command, or send through a browser, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-VOICE-CLONE-01': MET,
    'REQ-VOICE-CLONE-02': MET,
    'REQ-VOICE-CLONE-03': MET,
    'REQ-VOICE-CLONE-04': MET,
    'REQ-VOICE-CLONE-05': MET,
    'REQ-VOICE-CLONE-06': MET,
    'REQ-VOICE-CLONE-07': MET,
    'REQ-VOICE-CLONE-08': MET,
    'REQ-VOICE-CLONE-09': MET,
    'REQ-VOICE-CLONE-10': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
