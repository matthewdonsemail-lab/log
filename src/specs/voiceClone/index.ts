import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SHARED = 'src/extensions/voiceClone/client.ts'
const PROVIDER = 'src/extensions/voiceClone/helpers/provider.ts'
const RECORDINGS = 'src/extensions/voiceClone/helpers/recordings.ts'
const VOICE_NOTE = 'src/extensions/voiceClone/helpers/voiceNote.ts'
const AUDIO = 'src/extensions/voiceClone/helpers/audio.ts'
const STORE = 'src/extensions/voiceClone/helpers/store.ts'
const REALISM_FILE = 'src/extensions/voiceClone/helpers/realism.ts'
const SPOKEN = 'src/extensions/voiceClone/helpers/spoken.ts'
const TYPES = 'src/extensions/voiceClone/types.ts'
const ASSEMBLY = 'src/media/voiceNotes/client.ts'
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
  codePaths: [SHARED, PROVIDER, RECORDINGS, VOICE_NOTE, AUDIO, STORE, REALISM_FILE, SPOKEN, ASSEMBLY, INWORLD, FISH, CLONE, SENDS, RETIRED, MEDIA, DISCORD, INSTAGRAM, SLACK, INDEX, TYPES, 'src/extensions/inworld/types.ts', 'src/extensions/fishAudio/types.ts', 'python/twitterApi/engine.py'],
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
      { kind: 'symbol', file: SENDS, name: 'twitterVoiceCommand' },
      { kind: 'symbol', file: 'python/twitterApi/engine.py', name: 'xchat_voice' },
    ],
    'REQ-VOICE-CLONE-11': [
      { kind: 'symbol', file: PROVIDER, name: 'voiceSettingsOf' },
      { kind: 'symbol', file: INWORLD, name: 'cloneBodyOf' },
      { kind: 'symbol', file: INWORLD, name: 'steeredText' },
      { kind: 'symbol', file: STORE, name: 'replacedClone' },
      { kind: 'string', file: CLONE, includes: 'replace' },
      { kind: 'value', file: 'src/extensions/voiceClone/types.ts', name: 'DEFAULT_LANGUAGE', equals: 'en-IE' },
    ],
    'REQ-VOICE-CLONE-12': [
      { kind: 'symbol', file: PROVIDER, name: 'speedOf' },
      { kind: 'symbol', file: CLONE, name: 'namedRecordings' },
    ],
    'REQ-VOICE-CLONE-13': [
      { kind: 'symbol', file: REALISM_FILE, name: 'processLikeMatt' },
      { kind: 'symbol', file: REALISM_FILE, name: 'shapeLikeMatt' },
      { kind: 'symbol', file: REALISM_FILE, name: 'quietPieces' },
      { kind: 'symbol', file: REALISM_FILE, name: 'phoneCurveFilter' },
      { kind: 'symbol', file: SPOKEN, name: 'withBreaths' },
      { kind: 'symbol', file: VOICE_NOTE, name: 'voiceSteps' },
    ],
    'REQ-VOICE-CLONE-14': [
      { kind: 'symbol', file: SPOKEN, name: 'readSpoken' },
      { kind: 'symbol', file: SPOKEN, name: 'unknownAcronyms' },
      { kind: 'symbol', file: SPOKEN, name: 'speakableText' },
      { kind: 'symbol', file: VOICE_NOTE, name: 'listenTo' },
      { kind: 'symbol', file: TYPES, name: 'SPOKEN_LEXICON' },
    ],
    'REQ-VOICE-CLONE-16': [
      { kind: 'symbol', file: SPOKEN, name: 'withBreaths' },
      { kind: 'symbol', file: VOICE_NOTE, name: 'paceOf' },
      { kind: 'symbol', file: SENDS, name: 'voiceNoteCommandOf' },
    ],
    'REQ-VOICE-CLONE-15': [
      { kind: 'string', file: SENDS, includes: 'translationOf' },
      { kind: 'symbol', file: SPOKEN, name: 'wordsOf' },
      { kind: 'symbol', file: VOICE_NOTE, name: 'renderVoiceNote' },
    ],
    'REQ-VOICE-CLONE-10': [
      { kind: 'string', file: SENDS, includes: 'mattsWords' },
      { kind: 'string', file: SENDS, includes: 'the AI artifact check passed' },
      { kind: 'string', file: SENDS, includes: 'aiArtifacts' },
    ],
  },
  rubrics: {
    'REQ-VOICE-CLONE-01': noul('In src/extensions/voiceClone/client.ts and src/extensions/voiceClone/helpers/provider.ts, does voiceProvider return the provider client from PROVIDER_CLIENTS (inworld and fishAudio), does providerOf pick --provider, else LOG_VOICE_PROVIDER, else inworld and refuse any other name, and do src/cli/clone/index.ts and src/cli/voiceNote/index.ts import only from src/extensions/voiceClone, never from src/extensions/inworld or src/extensions/fishAudio?'),
    'REQ-VOICE-CLONE-02': noul('In src/extensions/inworld/client.ts, does createInworldClient call only POST /voices/v1/voices:clone with displayName, languageCode, description and voiceSamples of base64 audioData (with an optional transcription) and read voice.voiceId, and POST /tts/v1/voice with text, voiceId, modelId, an optional language and audioConfig.audioEncoding and read base64 audioContent, both with Authorization Basic and the INWORLD_API_KEY, answering voiceKeyMissing without a key; and does inworldProvider say wav references, limits 3 to 30 s and cheapest inworld-tts-2-flash?'),
    'REQ-VOICE-CLONE-03': noul('In src/extensions/fishAudio/client.ts, does createFishClient call only POST /model as multipart with type tts, title, train_mode fast, visibility private and the voices files and read _id, GET /model/{id}, and POST /v1/tts with JSON text, reference_id and format and a model header, with FISH_API_KEY as a bearer token; and does fishAudioProvider say references as they are, limits 10 to 60 s and cheapest s2.1-pro-free?'),
    'REQ-VOICE-CLONE-04': noul('In src/extensions/voiceClone/helpers/recordings.ts and src/cli/clone/index.ts, does mattsRecordings keep only recordings sentByMatt says he sent (fromMe true in the conversation store, or an ownMessage event in the .db), does pickReferences take them shortest first, at least 5 s each, within the provider most, and does cloneCommand voice list them without --apply, refuse under the provider least with voiceRecordingsMissing, convert to wav with wavOf when the provider referenceFormat is wav, call the provider clone only with --apply, and never clone again when readClone already holds that provider unless --replace is given; and does RETIRED_COMMANDS in src/cli/runner/helpers/retired.ts refuse log fish with the log clone form it became?'),
    'REQ-VOICE-CLONE-05': noul('In src/extensions/voiceClone/helpers/voiceNote.ts, does speakToFile refuse with voiceCloneMissing when the provider has no clone and with voiceNoteInvalid when textOnlyProblem finds the text empty, too long, an audio file name or an existing path, speak with the clone model unless a model is given, and write the audio under voiceNotesDir?'),
    'REQ-VOICE-CLONE-06': noul('In src/cli/voiceNote/index.ts, are discordVoiceCommand, instagramVoiceCommand and slackVoiceCommand all made by voiceNoteCommandOf, which has a provider flag and no flag for an audio file, refuses text that textOnlyProblem rejects as voiceNoteInvalid, returns a dry run without --live that calls neither render nor the engine, and refuses --live without --approvedBy as notApproved?'),
    'REQ-VOICE-CLONE-07': noul('With --live, does voiceNoteCommandOf in src/cli/voiceNote/index.ts refuse without a clone on the chosen provider, start rendering the note with that provider (voiceNoteDeps.render, renderVoiceNote speaking it and convertFor converting it with ffmpeg) before waitCaughtUp and the gate, so it is made while the account catches up and, unless --mattsWords is set, gateDeps.gate reads it, refuse accountBehind or voiceGateFailed without sending the note, await the render, and only after that call guardSend, refuse chatClaimedElsewhere when it is not ok, call the resolved engine send with the voice action, and call guard.done with sent or failed?'),
    'REQ-VOICE-CLONE-08': noul('Is voice in WRITES of python/discordApi/engine.py, python/instagramApi/engine.py and python/slackApi/engine.py; does each voice action take its file only through voice_note_path in python/platformKit/media.py (right suffix, non-empty, under the voiceNotes folder) and refuse voiceNoteInvalid otherwise; does voice_of request an upload slot, upload, and post the message with media.DISCORD_VOICE_FLAG, duration_secs and waveform; does voice_sync run under locked and bind curl_voice_rupload before direct_send_voice; and does the Slack voice call files.getUploadURLExternal, fetch_authenticated and files.completeUploadExternal, returning voiceNoteRefused on any refusal without retrying?'),
    'REQ-VOICE-CLONE-09': noul('In COMMAND_INDEX in src/cli/runner/helpers/commandIndex.ts, are there entries named voice with platform discord (discordVoiceCommand), slack (slackVoiceCommand), instagram (instagramVoiceCommand) and twitter (twitterVoiceCommand), all with module src/cli/voiceNote/index.ts; does twitterVoiceCommand in src/cli/voiceNote/index.ts refuse with xchatPinMissing when the account has no messengerPin, and send through context.directTwitter an action xchatVoice with screenName or userId, path, seconds, live, approvedBy and chatPin; and in python/twitterApi/engine.py is xchatVoice in WRITES, and does xchat_voice accept only a path from media_kit.voice_note_path with .m4a, unlock X Chat with xchat_read_keys when client._xchat is None, build the conversation id from the two user ids sorted ascending as integers, and call client.send_xchat_voice with the file bytes and its milliseconds?'),
    'REQ-VOICE-CLONE-11': noul('Does voiceSettingsOf in src/extensions/voiceClone/helpers/provider.ts default the accent to Irish and the language to en-IE with en-GB as the fallback; does cloneVoice in src/extensions/inworld/client.ts send languageCode, a description from accentDescriptionOf and each sample transcription when present (cloneBodyOf), and on a 400 matching INWORLD_LANGUAGE_REFUSED send it again once in the fallback language; does cloneCommand in src/cli/clone/index.ts clone over an existing clone only with --replace and write replacedClone, which keeps the old clone under previous; and does steeredText in src/extensions/inworld/client.ts send no accent instruction at all, only adding breaths through withBreaths for models in INWORLD_STEERING_MODELS (inworld-tts-2) and leaving the text unchanged for inworld-tts-2-flash?'),
    'REQ-VOICE-CLONE-10': noul('In src/cli/voiceNote/index.ts, does voiceNoteCommandOf have a mattsWords boolean flag, and with it set does a live send skip gateDeps.gate entirely while still refusing aiArtifacts from watermarkReadingOf(text), which runs before the flag is looked at, and without it does a live send still call gateDeps.gate and refuse voiceGateFailed?'),
    'REQ-VOICE-CLONE-12': noul('In src/extensions/voiceClone/helpers/provider.ts, does speedOf default to DEFAULT_SPEED and clamp to SPEED_RANGE, and does voiceSettingsOf read it from LOG_VOICE_SPEED, with speakToFile in src/extensions/voiceClone/helpers/voiceNote.ts sending that speed through paceOf (its small drift per text is REQ-VOICE-CLONE-16, not a different speed); does createInworldClient in src/extensions/inworld/client.ts send the request speed as audioConfig.speakingRate; and does cloneCommand in src/cli/clone/index.ts take a from flag whose files namedRecordings turns into recordings, read each one words through cloneDeps.sidecar, and record client.preferred, else client.cheapest, as the clone model, which speakToFile speaks with (model ?? clone.model) unless a model is passed?'),
    'REQ-VOICE-CLONE-13': noul('In src/extensions/voiceClone/helpers/voiceNote.ts, does speakToFile always ask the provider for wav and run voiceSteps.process on it (processLikeMatt with the paths of mattsRecordings by default) before listening, refusing voiceProcessingFailed when it fails; and in src/extensions/voiceClone/helpers/realism.ts does processLikeMatt decode with REALISM.shape followed by phoneCurveFilter (a firequalizer of REALISM.phoneCurve, the tone curve measured between his own voice notes and the clone) and does shapeLikeMatt apply a smooth gain drift of REALISM.movementDb, a swaying low-pass, tanh saturation at REALISM.drive, room tone built by roomTone from quietPieces of the recordings (none from a recording whose floor is under REALISM.silentFloorDb) at REALISM.snrDb under the voice level, and a peak of REALISM.peakDb, deterministic for the same seed?'),
    'REQ-VOICE-CLONE-14': noul('In src/extensions/voiceClone/helpers/voiceNote.ts, does speakToFile refuse pronunciationUnknown when unknownAcronyms finds an acronym not in SPOKEN_LEXICON before calling the provider, send speakableText(text) to the provider, call voiceSteps.listen after shaping and refuse spokenCheckFailed when it fails, and refuse spokenMismatch, deleting the file, when readSpoken in src/extensions/voiceClone/helpers/spoken.ts says a lexicon word was heard as something else, spelled out, took longer than WORD_MOST_MS, or more than SPOKEN_MOST_ERROR of the words differ; and does renderVoiceNote go through speakToFile so nothing is converted or sent before that check?'),
    'REQ-VOICE-CLONE-16': noul('In src/extensions/voiceClone/helpers/spoken.ts, does withBreaths never put a breath before the first sentence, split on . ! ? and the Chinese 。！？, put a breath before a later sentence only once the spoken length since the last breath (Han, Hiragana, Katakana and Hangul characters counting half) reaches a gap drawn from seeded(seed) between BREATH_WORDS.least and BREATH_WORDS.most, and leave text that already has a [breathe] unchanged; does steeredText in src/extensions/inworld/client.ts seed it from the text only for INWORLD_STEERING_MODELS; does paceOf in src/extensions/voiceClone/helpers/voiceNote.ts move the speed by at most PACE_JITTER from a seed of the text within SPEED_RANGE, with speakToFile sending paceOf as the speed; and does voiceNoteCommandOf in src/cli/voiceNote/index.ts call gateDeps.gate with spoken: true?'),
    'REQ-VOICE-CLONE-15': noul('In src/cli/voiceNote/index.ts, does voiceNoteCommandOf take translationOf and language flags, refuse voiceNoteInvalid before gating or rendering when translationOf is given without language, when translationOf is given with mattsWords, or when language is not a code like zh-CN, pass translationOf (not the text) as the text gateDeps.gate grades, read the text and translationOf together with watermarkReadingOf, and pass the language to voiceNoteDeps.render; does renderVoiceNote in src/extensions/voiceClone/helpers/voiceNote.ts pass it to speakToFile, which speaks in that language instead of clone.language; and does wordsOf in src/extensions/voiceClone/helpers/spoken.ts split Han, Hiragana, Katakana and Hangul characters into one token each beside Latin words?'),
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
    'REQ-VOICE-CLONE-11': MET,
    'REQ-VOICE-CLONE-12': MET,
    'REQ-VOICE-CLONE-13': MET,
    'REQ-VOICE-CLONE-14': MET,
    'REQ-VOICE-CLONE-15': MET,
    'REQ-VOICE-CLONE-16': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
