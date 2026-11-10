import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CLIENT = 'src/media/describer/client.ts'
const MODEL = 'src/media/describer/helpers/model.ts'
const TYPES = 'src/media/describer/types.ts'
const WATCH = 'src/inbox/watch/client.ts'
const CONTEXT = 'src/inbox/context/client.ts'
const FFMPEG = 'src/media/describer/helpers/ffmpeg.ts'
const SCENES = 'src/media/describer/helpers/scenes.ts'
const SPEECH = 'src/media/describer/helpers/speech.ts'
const MIGRATIONS = 'src/storage/schema/helpers/migrations.ts'
const MCP_SERVER = 'src/mcp/server/index.ts'
const MEDIA_CLI = 'src/cli/media/index.ts'

export const mediaDescriber = {
  description: 'Every image, meme and video described by one local model into the .db before anyone replies',
  specPath: 'docs/specs/mediaDescriber.md',
  codePaths: ['src/media/describer/client.ts', 'src/media/describer/helpers/model.ts', 'src/media/describer/helpers/ffmpeg.ts', 'src/media/describer/helpers/scenes.ts', 'src/media/describer/helpers/speech.ts', 'src/media/describer/types.ts', 'scripts/media/describer.ts', 'src/storage/schema/helpers/migrations.ts', 'src/mcp/server/index.ts', 'src/cli/runner/client.ts', 'src/cli/media/index.ts', 'src/inbox/watch/client.ts', 'src/inbox/context/client.ts', 'src/inbox/dbRead/client.ts', 'src/inbox/store/client.ts', 'src/inbox/catchUp/client.ts', 'scripts/hooks/inbox.ts', 'src/cli/discord/index.ts', 'src/cli/slack/index.ts', 'src/cli/instagram/index.ts', 'src/cli/twitter/helpers/chat.ts', 'python/platformKit/media.py', 'python/slackApi/engine.py', 'python/instagramApi/engine.py', 'python/discordApi/engine.py'],
  anchors: {
    'REQ-MEDIA-01': [
      { kind: 'symbol', file: CLIENT, name: 'runDescriber' },
      { kind: 'symbol', file: MODEL, name: 'loadDescriber' },
      { kind: 'value', file: TYPES, name: 'VISION_MODEL', equals: 'onnx-community/LFM2.5-VL-450M-ONNX' },
      { kind: 'symbol', file: WATCH, name: 'startDescriber' },
      { kind: 'symbol', file: WATCH, name: 'describerEnv' },
    ],
    'REQ-MEDIA-02': [
      { kind: 'value', file: TYPES, name: 'DESCRIBER_HEARTBEAT_MS', equals: 5000 },
      { kind: 'string', file: CLIENT, includes: 'describerMemory' },
    ],
    'REQ-MEDIA-03': [
      { kind: 'symbol', file: CLIENT, name: 'describeRow' },
      { kind: 'symbol', file: SCENES, name: 'describeWith' },
    ],
    'REQ-MEDIA-09': [
      { kind: 'symbol', file: CLIENT, name: 'ingestRow' },
      { kind: 'symbol', file: FFMPEG, name: 'previewOf' },
      { kind: 'symbol', file: FFMPEG, name: 'sheetOf' },
      { kind: 'symbol', file: MIGRATIONS, name: 'MEDIA_COLUMNS' },
      { kind: 'value', file: TYPES, name: 'PREVIEW_WIDTH', equals: 320 },
    ],
    'REQ-MEDIA-10': [
      { kind: 'symbol', file: FFMPEG, name: 'sceneCutsOf' },
      { kind: 'symbol', file: FFMPEG, name: 'soundtrackOf' },
      { kind: 'symbol', file: SCENES, name: 'spansOf' },
      { kind: 'symbol', file: SCENES, name: 'timelineOf' },
      { kind: 'symbol', file: SPEECH, name: 'assemblyAiTranscriber' },
      { kind: 'value', file: TYPES, name: 'MAX_SCENES', equals: 8 },
    ],
    'REQ-MEDIA-11': [
      { kind: 'symbol', file: CLIENT, name: 'removeSpoolFile' },
      { kind: 'symbol', file: CLIENT, name: 'nextMedia' },
      { kind: 'value', file: TYPES, name: 'QUEUE_FULL_DETAIL', equals: 'the describer queue was full' },
    ],
    'REQ-MEDIA-12': [
      { kind: 'symbol', file: CLIENT, name: 'mediaView' },
      { kind: 'symbol', file: MCP_SERVER, name: 'ToolImage' },
      { kind: 'string', file: MEDIA_CLI, includes: 'returned as an image' },
      { kind: 'symbol', file: CLIENT, name: 'mediaByPath' },
    ],
    'REQ-MEDIA-04': [
      { kind: 'symbol', file: CLIENT, name: 'enqueueMedia' },
      { kind: 'symbol', file: CLIENT, name: 'enqueueAttachments' },
      { kind: 'value', file: TYPES, name: 'QUEUE_LIMIT', equals: 20 },
      { kind: 'string', file: CLIENT, includes: 'mediaQueueFull' },
    ],
    'REQ-MEDIA-06': [
      { kind: 'symbol', file: 'python/platformKit/media.py', name: 'is_visual' },
      { kind: 'symbol', file: 'python/slackApi/engine.py', name: 'saved_visuals' },
      { kind: 'symbol', file: 'python/instagramApi/engine.py', name: 'media_ref_of' },
      { kind: 'symbol', file: 'python/instagramApi/engine.py', name: 'saved_media' },
      { kind: 'symbol', file: 'python/discordApi/engine.py', name: 'with_visuals' },
    ],
    'REQ-MEDIA-07': [
      { kind: 'symbol', file: 'python/discordApi/engine.py', name: 'saved_images' },
      { kind: 'symbol', file: 'src/cli/discord/index.ts', name: 'attachmentLines' },
      { kind: 'symbol', file: 'src/cli/discord/index.ts', name: 'storedAttachmentsOf' },
      { kind: 'symbol', file: 'src/inbox/dbRead/client.ts', name: 'mediaNotSaved' },
      { kind: 'symbol', file: 'src/inbox/store/client.ts', name: 'addToPayload' },
    ],
    'REQ-MEDIA-08': [
      { kind: 'symbol', file: 'python/platformKit/media.py', name: 'is_text_file' },
      { kind: 'symbol', file: 'python/platformKit/media.py', name: 'text_problem' },
      { kind: 'symbol', file: 'python/platformKit/media.py', name: 'visual_problem' },
      { kind: 'symbol', file: 'python/platformKit/media.py', name: 'not_opened' },
      { kind: 'symbol', file: 'python/discordApi/engine.py', name: 'saved_files' },
      { kind: 'symbol', file: 'src/cli/discord/index.ts', name: 'UNTRUSTED_FILE_LINE' },
    ],
    'REQ-MEDIA-05': [
      { kind: 'symbol', file: CLIENT, name: 'mediaLine' },
      { kind: 'symbol', file: CONTEXT, name: 'chatContextOf' },
    ],
  },
  rubrics: {
    'REQ-MEDIA-01': noul('Does runDescriber take the owners lock for platform model and account describer through claimWatcher and return a refusal when another live pid holds it, call options.load once before its loop, and take items one at a time with nextMedia; does loadDescriber load VISION_MODEL with VISION_DTYPE (q4) through AutoProcessor and AutoModelForImageTextToText; and does the inbox hook call ensureLiveWatchers for model describer with startDescriber, which spawns log media describer with describerEnv (PATH without msys or mingw folders)?'),
    'REQ-MEDIA-02': noul('Does runDescriber write a heartbeat to its owners row every DESCRIBER_HEARTBEAT_MS, and when the memory reading passes its ceiling add a describerMemory alert and stop with a refusal?'),
    'REQ-MEDIA-03': noul('Does describeRow describe an image through describeWith, which tries each describer in the order given and uses the next one when one throws or answers empty, label the description with the row kind, store it with the model and the providers tried on the media row as described, and store its vector with saveVectors when an embedder is given; and does runDescriber accept one describer or an ordered list from load and mark a row failed with the reason when describing throws?'),
    'REQ-MEDIA-09': noul('Does ingestRow, for a row whose file is on disk and has no preview yet, store its sha256, size, duration, width and height from ffprobe and, for an image, gif or video, a small JPEG preview made by ffmpeg through a pipe (previewOf at PREVIEW_WIDTH for a still, sheetOf, a grid of frames, for a moving picture) in the media row of log.db, with the columns added by migration 17 from MEDIA_COLUMNS?'),
    'REQ-MEDIA-10': noul('Does describeRow, for a video or a gif that is not a .gif file, find scene changes with sceneCutsOf, turn them into at most MAX_SCENES spans with spansOf, describe one keyframe per span taken by frameAt through a pipe with SCENE_PROMPT, transcribe the soundtrack taken by soundtrackOf through the given transcriber (assemblyAiTranscriber keeps each transcript by its hash), put each word in the span it was said in, and store the timestamped lines from timelineOf, the scenes and the transcript, saying no sound when there is none?'),
    'REQ-MEDIA-11': noul('Does removeSpoolFile, once a row has its preview and description, delete the engine-downloaded file only when the platform is not local, the row is an image, meme, gif or video and the path is inside a media folder, and record fileRemovedAt; does describeRow describe a row from its kept preview when the file is gone; and does nextMedia take a row the queue was too full for (QUEUE_FULL_DETAIL) once no row is pending?'),
    'REQ-MEDIA-12': noul('Does log media view <id> return the item line and, through context.image, its preview so that an MCP tool call answers with an image content block (ToolImage) beside the text; and does a Discord read show a kept item by its mediaLine (found with mediaByPath) once its downloaded file was removed?'),
    'REQ-MEDIA-04': noul('Does enqueueMedia mark audio, plain files, items without a path and items past QUEUE_LIMIT waiting as notDescribed with a detail saying why, add a mediaQueueFull alert for the full queue, and queue the rest as pending; and do the discord, slack and instagram watch commands call enqueueAttachments with each inbox message and its attachments?'),
    'REQ-MEDIA-05': noul('Does chatContextOf attach mediaLine of every media row of each message as mediaLines, does mediaLine give the description once described (with where to view its picture when a preview is kept), a voice note transcript found by its sha256, and a not described yet line with the detail otherwise, and does the inbox messageOf add the same lines to the text it shows?'),
    'REQ-MEDIA-06': noul('Does is_visual say true for image and video types and suffixes and false for audio; does the slack watch, for a message from someone else with visual attachments, fetch each through core.http.fetch_authenticated with file_of (refusing files over VISUAL_MAX_BYTES) before it calls live with the saved paths; does the instagram realtime dispatch take media_ref_of the item (image, video or gif url) and, in a thread, fetch it with saved_media through client.private.get under the HTTP lock, never instagrapi photo or video downloads, before emitting the event with its attachment path; does the discord watch, for a message from someone else that is a DM, mentions the account or replies to it, keep each visual attachment with with_visuals through its REST client get_file (deleting one over VISUAL_MAX_BYTES), and leave guild messages to others untouched; and does the X chat watch pass each message media filename, type and path to enqueueAttachments?'),
    'REQ-MEDIA-07': noul('Does the discord engine read_message, unless saveImages is false, keep each visual attachment with saved_images through with_visuals and return them as images without their url; does log discord read print each image with attachmentLines as [image] name and its saved path or why it was not saved, store each message with storedAttachmentsOf so the .db keeps the paths, and go to Discord with reason mediaNotSaved when mediaNotSaved says a stored message has a visual attachment with no path and no error, or no text and no attachments recorded; does storeRead add the attachments to an already stored message with addToPayload; does discordInboxMessageOf keep the watch attachments with their saved paths and the message id; and does the voice gate read of the room pass saveImages false?'),
    'REQ-MEDIA-08': noul('Does the discord engine save a sent file only when is_text_file says it is .txt, .tsv, .csv, .md or .json and it is under TEXT_MAX_BYTES, delete it when text_problem finds a NUL byte or bytes that are not UTF-8, list every other non-audio non-visual file with not_opened without downloading it, and keep an image or video only when visual_problem finds a real image or video signature; and does log discord read show a saved text file with its path and preview under UNTRUSTED_FILE_LINE?'),
    unspecifiedBehavior: noul('Does the describer send pictures to a remote service to describe them, send anything but a video soundtrack to the transcriber, run more than one model process, delete a file outside an engine media folder or a local file a person asked about, or let a message with undescribed media reach the context without saying so, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-MEDIA-01': MET,
    'REQ-MEDIA-02': MET,
    'REQ-MEDIA-03': MET,
    'REQ-MEDIA-04': MET,
    'REQ-MEDIA-05': MET,
    'REQ-MEDIA-06': MET,
    'REQ-MEDIA-07': MET,
    'REQ-MEDIA-08': MET,
    'REQ-MEDIA-09': MET,
    'REQ-MEDIA-10': MET,
    'REQ-MEDIA-11': MET,
    'REQ-MEDIA-12': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
