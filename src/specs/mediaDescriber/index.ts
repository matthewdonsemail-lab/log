import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CLIENT = 'src/media/describer/client.ts'
const MODEL = 'src/media/describer/helpers/model.ts'
const TYPES = 'src/media/describer/types.ts'
const WATCH = 'src/inbox/watch/client.ts'
const CONTEXT = 'src/inbox/context/client.ts'

export const mediaDescriber = {
  description: 'Every image, meme and video described by one local model into the .db before anyone replies',
  specPath: 'docs/specs/mediaDescriber.md',
  codePaths: ['src/media/describer/client.ts', 'src/media/describer/helpers/model.ts', 'src/media/describer/types.ts', 'src/cli/media/index.ts', 'src/inbox/watch/client.ts', 'src/inbox/context/client.ts', 'scripts/hooks/inbox.ts', 'src/cli/discord/index.ts', 'src/cli/slack/index.ts', 'src/cli/instagram/index.ts'],
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
      { kind: 'symbol', file: CLIENT, name: 'framesOf' },
    ],
    'REQ-MEDIA-04': [
      { kind: 'symbol', file: CLIENT, name: 'enqueueMedia' },
      { kind: 'symbol', file: CLIENT, name: 'enqueueAttachments' },
      { kind: 'value', file: TYPES, name: 'QUEUE_LIMIT', equals: 20 },
      { kind: 'string', file: CLIENT, includes: 'mediaQueueFull' },
    ],
    'REQ-MEDIA-05': [
      { kind: 'symbol', file: CLIENT, name: 'mediaLine' },
      { kind: 'symbol', file: CONTEXT, name: 'chatContextOf' },
    ],
  },
  rubrics: {
    'REQ-MEDIA-01': noul('Does runDescriber take the owners lock for platform model and account describer through claimWatcher and return a refusal when another live pid holds it, call options.load once before its loop, and take items one at a time with nextMedia; does loadDescriber load VISION_MODEL with VISION_DTYPE (q4) through AutoProcessor and AutoModelForImageTextToText; and does the inbox hook call ensureLiveWatchers for model describer with startDescriber, which spawns log media describer with describerEnv (PATH without msys or mingw folders)?'),
    'REQ-MEDIA-02': noul('Does runDescriber write a heartbeat to its owners row every DESCRIBER_HEARTBEAT_MS, and when the memory reading passes its ceiling add a describerMemory alert and stop with a refusal?'),
    'REQ-MEDIA-03': noul('Does describeRow describe a video from the frames framesOf takes with ffmpeg at VIDEO_FRAMES, label the description with the row kind, store it with the model on the media row as described, and store its vector with saveVectors when an embedder is given; and does runDescriber mark a row failed with the reason when describing throws?'),
    'REQ-MEDIA-04': noul('Does enqueueMedia mark audio, plain files, items without a path and items past QUEUE_LIMIT waiting as notDescribed with a detail saying why, add a mediaQueueFull alert for the full queue, and queue the rest as pending; and do the discord, slack and instagram watch commands call enqueueAttachments with each inbox message and its attachments?'),
    'REQ-MEDIA-05': noul('Does chatContextOf attach mediaLine of every media row of each message as mediaLines, does mediaLine give the description once described and a not described yet line with the detail otherwise, and does the inbox messageOf add the same lines to the text it shows?'),
    unspecifiedBehavior: noul('Does the describer send media to a remote service to describe it, describe audio, run more than one model process, or let a message with undescribed media reach the context without saying so, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-MEDIA-01': MET,
    'REQ-MEDIA-02': MET,
    'REQ-MEDIA-03': MET,
    'REQ-MEDIA-04': MET,
    'REQ-MEDIA-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
