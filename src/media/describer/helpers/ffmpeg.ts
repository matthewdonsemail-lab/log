import { spawnSync } from 'node:child_process'
import { FRAME_WIDTH, PREVIEW_WIDTH, SCENE_THRESHOLD, SHEET_COLUMNS, SHEET_ROWS, SHEET_TILE_WIDTH } from '../types'
import type { Probe } from '../types'

export interface Tools {
  ffmpeg: string
  ffprobe: string
}

export const DEFAULT_TOOLS: Tools = { ffmpeg: process.env.LOG_FFMPEG || 'ffmpeg', ffprobe: process.env.LOG_FFPROBE || 'ffprobe' }

const MAX_BUFFER = 256 * 1024 * 1024

function piped(tool: string, args: string[]): Uint8Array | null {
  const run = spawnSync(tool, args, { windowsHide: true, maxBuffer: MAX_BUFFER })
  if (run.status !== 0 || !run.stdout || !run.stdout.length) return null
  return new Uint8Array(run.stdout)
}

export function probeOf(path: string, tools: Tools = DEFAULT_TOOLS): Probe {
  const run = spawnSync(tools.ffprobe, ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', path], { encoding: 'utf8', windowsHide: true, maxBuffer: MAX_BUFFER })
  const empty: Probe = { durationMs: null, width: null, height: null, hasAudio: false, hasVideo: false }
  if (run.status !== 0) return empty
  try {
    const answer = JSON.parse(run.stdout) as { format?: { duration?: string }; streams?: { codec_type?: string; width?: number; height?: number }[] }
    const streams = answer.streams ?? []
    const video = streams.find((s) => s.codec_type === 'video')
    const seconds = Number(answer.format?.duration)
    return {
      durationMs: Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : null,
      width: video?.width ?? null,
      height: video?.height ?? null,
      hasAudio: streams.some((s) => s.codec_type === 'audio'),
      hasVideo: !!video,
    }
  } catch {
    return empty
  }
}

export function previewOf(path: string, tools: Tools = DEFAULT_TOOLS): Uint8Array | null {
  return piped(tools.ffmpeg, ['-v', 'error', '-i', path, '-frames:v', '1', '-vf', `scale='min(${PREVIEW_WIDTH},iw)':-2`, '-f', 'image2pipe', '-vcodec', 'mjpeg', '-q:v', '6', '-'])
}

export function sheetOf(path: string, durationMs: number, tools: Tools = DEFAULT_TOOLS): Uint8Array | null {
  const tiles = SHEET_COLUMNS * SHEET_ROWS
  const rate = Math.max(tiles / Math.max(durationMs / 1000, 0.5), 0.01)
  return piped(tools.ffmpeg, ['-v', 'error', '-i', path, '-vf', `fps=${rate.toFixed(4)},scale=${SHEET_TILE_WIDTH}:-2,tile=${SHEET_COLUMNS}x${SHEET_ROWS}`, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-q:v', '6', '-'])
}

export function sceneCutsOf(path: string, tools: Tools = DEFAULT_TOOLS, threshold = SCENE_THRESHOLD): number[] {
  const run = spawnSync(tools.ffmpeg, ['-hide_banner', '-i', path, '-an', '-vf', `scale=160:-2,select='gt(scene,${threshold})',showinfo`, '-f', 'null', '-'], { encoding: 'utf8', windowsHide: true, maxBuffer: MAX_BUFFER })
  return [...String(run.stderr ?? '').matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1])).filter((t) => Number.isFinite(t) && t > 0)
}

export function frameAt(path: string, seconds: number, tools: Tools = DEFAULT_TOOLS): Uint8Array | null {
  return piped(tools.ffmpeg, ['-v', 'error', '-ss', seconds.toFixed(2), '-i', path, '-frames:v', '1', '-vf', `scale='min(${FRAME_WIDTH},iw)':-2`, '-f', 'image2pipe', '-vcodec', 'png', '-'])
}

export function soundtrackOf(path: string, tools: Tools = DEFAULT_TOOLS): Uint8Array | null {
  return piped(tools.ffmpeg, ['-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'])
}
