import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TYPES = 'src/media/voiceNotes/types.ts'
const CLIENT = 'src/media/voiceNotes/client.ts'
const STORE = 'src/media/voiceNotes/helpers/store.ts'
const NOTES = 'src/media/voiceNotes/helpers/notes.ts'
const RUN = 'src/media/voiceNotes/helpers/run.ts'
const COMMAND = 'src/cli/transcribe/index.ts'
const SAVE = 'src/search/conversations/client.ts'
const DISCORD = 'python/discordApi/engine.py'
const DISCORD_CLI = 'src/cli/discord/index.ts'
const DMS = 'src/cli/twitter/helpers/dms.ts'
const HOOK = 'scripts/hooks/inbox.ts'
const MEDIA_PY = 'python/platformKit/media.py'
const MEDIA_TS = 'src/platformKit/media/client.ts'
const MEDIA_TYPES = 'src/platformKit/media/types.ts'
const SLACK = 'python/slackApi/engine.py'
const TEMPLATES = 'src/scaffold/platform/helpers/templates.ts'
const PLATFORMS_CHECK = 'scripts/checks/checkPlatforms.ts'

export const voiceNotes = {
  description: 'Voice notes on X and Discord transcribed with AssemblyAI, kept by file hash and written into the conversation store',
  specPath: 'docs/specs/voiceNotes.md',
  codePaths: [TYPES, CLIENT, STORE, NOTES, RUN, COMMAND, SAVE, DISCORD, DISCORD_CLI, DMS, HOOK, MEDIA_PY, MEDIA_TS, MEDIA_TYPES, SLACK, TEMPLATES, PLATFORMS_CHECK],
  anchors: {
    'REQ-TRANSCRIBE-01': [
      { kind: 'value', file: TYPES, name: 'ASSEMBLY_AI_API', equals: 'https://api.assemblyai.com/v2' },
      { kind: 'value', file: TYPES, name: 'POLL_FOR_MS', equals: 900000 },
      { kind: 'symbol', file: CLIENT, name: 'createAssemblyAiClient' },
      { kind: 'string', file: CLIENT, includes: 'no upload_url in the answer' },
      { kind: 'string', file: CLIENT, includes: 'completed' },
    ],
    'REQ-TRANSCRIBE-02': [
      { kind: 'value', file: TYPES, name: 'ASSEMBLY_AI_KEY_NAME', equals: 'ASSEMBLYAI_API_KEY' },
      { kind: 'symbol', file: CLIENT, name: 'assemblyAiKey' },
      { kind: 'string', file: CLIENT, includes: 'assemblyAiKeyMissing' },
      { kind: 'string', file: COMMAND, includes: 'assemblyAiKeyMissing' },
    ],
    'REQ-TRANSCRIBE-03': [{ kind: 'string', file: CLIENT, includes: 'transcriptionFailed' }],
    'REQ-TRANSCRIBE-04': [
      { kind: 'symbol', file: CLIENT, name: 'hashOf' },
      { kind: 'symbol', file: STORE, name: 'transcribeFile' },
      { kind: 'symbol', file: STORE, name: 'readTranscript' },
    ],
    'REQ-TRANSCRIBE-05': [
      { kind: 'symbol', file: STORE, name: 'withTranscripts' },
      { kind: 'symbol', file: STORE, name: 'applyTranscripts' },
      { kind: 'symbol', file: TYPES, name: 'AUDIO_LEFTOVER' },
    ],
    'REQ-TRANSCRIBE-06': [{ kind: 'symbol', file: SAVE, name: 'saveConversations' }],
    'REQ-TRANSCRIBE-07': [
      { kind: 'symbol', file: DISCORD, name: 'attachments_of' },
      { kind: 'symbol', file: DISCORD, name: 'exported_message' },
      { kind: 'symbol', file: DISCORD, name: 'read_message' },
      { kind: 'symbol', file: DISCORD, name: 'text_of' },
    ],
    'REQ-TRANSCRIBE-08': [
      { kind: 'symbol', file: NOTES, name: 'twitterVoiceNotes' },
      { kind: 'symbol', file: COMMAND, name: 'fetchTwitter' },
    ],
    'REQ-TRANSCRIBE-09': [
      { kind: 'symbol', file: DISCORD, name: 'voice_notes_of' },
      { kind: 'symbol', file: DISCORD, name: 'audio_file_of' },
      { kind: 'string', file: COMMAND, includes: 'voiceNotes' },
    ],
    'REQ-TRANSCRIBE-10': [
      { kind: 'symbol', file: DISCORD, name: 'sound_search_of' },
      { kind: 'symbol', file: COMMAND, name: 'findDiscord' },
    ],
    'REQ-TRANSCRIBE-11': [
      { kind: 'symbol', file: COMMAND, name: 'withVoiceNotes' },
      { kind: 'symbol', file: RUN, name: 'inboxTextWithVoiceNotes' },
      { kind: 'symbol', file: DMS, name: 'audioOf' },
      { kind: 'symbol', file: DISCORD_CLI, name: 'discordReadCommand' },
    ],
    'REQ-TRANSCRIBE-12': [
      { kind: 'value', file: MEDIA_TYPES, name: 'DISCORD_VOICE_FLAG', equals: 8192 },
      { kind: 'symbol', file: MEDIA_TS, name: 'isAudio' },
      { kind: 'symbol', file: MEDIA_PY, name: 'is_audio' },
      { kind: 'symbol', file: MEDIA_PY, name: 'text_with_audio' },
      { kind: 'symbol', file: SLACK, name: 'files_of' },
    ],
    'REQ-TRANSCRIBE-13': [{ kind: 'symbol', file: TEMPLATES, name: 'pythonEngine' }],
  },
  rubrics: {
    'REQ-TRANSCRIBE-01': noul('Does createAssemblyAiClient POST the bytes to /upload, POST /transcript with the upload_url as audio_url, then GET /transcript/<id> after each wait until status is completed or error or POLL_FOR_MS has passed, with the key as the authorization header on every call?'),
    'REQ-TRANSCRIBE-02': noul('When there is no key, does transcribe return code assemblyAiKeyMissing without calling the fetcher, and does the transcribe command refuse with assemblyAiKeyMissing before it loads any engine or calls directDiscord or openTwitterAccount?'),
    'REQ-TRANSCRIBE-03': noul('Does the client return ok false with code transcriptionFailed, the HTTP status and the error AssemblyAI gave, when an answer is not 200 or the transcript status is error?'),
    'REQ-TRANSCRIBE-04': noul('Does transcribeFile hash the file with sha256 and return the kept transcript from the transcripts folder without calling the client when that hash is already kept, writing a new transcript there only after the client answers ok?'),
    'REQ-TRANSCRIBE-05': noul('Does applyTranscripts replace an (audio: name) marker with the voice note text only when messages.json ties that platform, account, message id and name to a kept transcript, and remove the (audio saved: ...) leftover only when something was replaced?'),
    'REQ-TRANSCRIBE-06': noul('Does saveConversations pass the conversations through applyTranscripts before it writes any file?'),
    'REQ-TRANSCRIBE-07': noul('Do the Discord export, read and watch keep each message attachment name, type and duration, and does text_of add an (audio: name) marker for each audio attachment to the message text?'),
    'REQ-TRANSCRIBE-08': noul('Does the transcribe command fetch a missing X voice note only by calling the account engine inbox action with the conversationId and mediaEvents, with no fetch of its own to X?'),
    'REQ-TRANSCRIBE-09': noul('Does voice_notes_of search each channel with has=sound through the vendored client request, sleep between calls, and save each audio attachment through client.get_file from the url the search answered?'),
    'REQ-TRANSCRIBE-10': noul('When the Discord sound search answers anything other than 200 or 202, does voice_notes_of stop the whole search at once with Discord answer and the notes found so far, retrying nothing, and does the command stop fetching for an X account after one failed read?'),
    'REQ-TRANSCRIBE-11': noul('Do discordRead and twitterDms (with and conversation) pass their messages through withVoiceNotes before showing them, does the Discord watch transcribe a voice message before adding it to the inbox, and does the inbox hook pass each pending message text through inboxTextWithVoiceNotes?'),
    'REQ-TRANSCRIBE-12': noul('Does is_audio in python/platformKit/media.py return true for a type starting with one of AUDIO_TYPES (audio/ and video/ogg), a subtype in SLACK_AUDIO_SUBTYPES, a waveform, or message_flags with DISCORD_VOICE_FLAG (8192) set and a duration, return false for any other video/ or image/ type, and otherwise check the name against AUDIO_SUFFIXES; does python/discordApi/engine.py decide audio only through its is_audio, which calls media.is_audio, passing the message flags in read_message and in the gateway watch; does python/slackApi/engine.py call media.is_audio; and does isAudio in src/platformKit/media/client.ts make the same checks in the same order, after first returning the audio field the attachment already carries when an engine set it?'),
    'REQ-TRANSCRIBE-13': noul('Does the engine template written by log new platform import platformKit media and build each message with its attachments and media.text_with_audio, and does checkPlatforms refuse an engine that answers with messages but lacks that import or an attachments or media field?'),
    unspecifiedBehavior: noul('Does the code send a voice note, a key or a token anywhere other than AssemblyAI and the platform engines, retry a platform refusal, or send a file to AssemblyAI whose hash already has a kept transcript, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-TRANSCRIBE-01': MET,
    'REQ-TRANSCRIBE-02': MET,
    'REQ-TRANSCRIBE-03': MET,
    'REQ-TRANSCRIBE-04': MET,
    'REQ-TRANSCRIBE-05': MET,
    'REQ-TRANSCRIBE-06': MET,
    'REQ-TRANSCRIBE-07': MET,
    'REQ-TRANSCRIBE-08': MET,
    'REQ-TRANSCRIBE-09': MET,
    'REQ-TRANSCRIBE-10': MET,
    'REQ-TRANSCRIBE-11': MET,
    'REQ-TRANSCRIBE-12': MET,
    'REQ-TRANSCRIBE-13': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
