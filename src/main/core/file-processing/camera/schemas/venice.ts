import * as z from 'zod'
import path from 'path'
import { CameraMetadataZod, format } from 'daytalog'
import type { CameraMetadataType } from 'daytalog'

/**
 * Converts an 8‑digit string (FFSSMMHH) into "HH:MM:SS:FF".
 * @param code - 8‑digit string where:
 *   - code[0..2] = frames
 *   - code[2..4] = seconds
 *   - code[4..6] = minutes
 *   - code[6..8] = hours
 * @returns timecode string "HH:MM:SS:FF"
 */
function parseTimecode(code: string): string | undefined {
  if (!code) return undefined
  if (!/^\d{8}$/.test(code)) {
    return undefined
    throw new Error(`Invalid timecode "${code}", must be 8 digits`)
  }
  const frames = code.slice(0, 2)
  const seconds = code.slice(2, 4)
  const minutes = code.slice(4, 6)
  const hours = code.slice(6, 8)
  return `${hours}:${minutes}:${seconds}:${frames}`
}

function extractCodec(str: string): string {
  const knownCodecs = ['X-OCN LT', 'X-OCN ST', 'X-OCN XT', 'ProRes4444']
  for (const codec of knownCodecs) {
    if (str.includes(codec.replace(/\s/g, '_')) || str.includes(codec)) {
      return codec
    }
  }
  return ''
}

function toNumber(v) {
  if (typeof v !== 'string') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function parseShutterAngle(v?: string): number | undefined {
  if (!v) return undefined
  if (v.endsWith('deg')) {
    const num = Number(v.replace('deg', ''))
    return Number.isFinite(num) ? num : undefined
  }
  const n = Number(v)
  return Number.isFinite(n) ? n / 100 : undefined
}

const sonyModelMap: Record<string, string> = {
  'MPC-3610': 'Sony VENICE (6K)',
  'MPC-3626': 'Sony VENICE 2 (6K)',
  'MPC-3628': 'Sony VENICE 2 (8.6K)',
  'MPC-2610': 'Sony BURANO (8K)'
}

function mapSonyModel(modelName?: string): string | undefined {
  return modelName ? sonyModelMap[modelName] : undefined
}

const XmlSchema = z.object({
  version: z.string(),
  encoding: z.string(),
  standalone: z.string().optional()
})

const LtcChangeItemSchema = z.object({
  frameCount: z.coerce.number(),
  status: z.string(),
  value: z.string()
})

const LtcChangeTableSchema = z
  .object({
    LtcChange: z.array(LtcChangeItemSchema),
    tcFps: z.coerce.number().optional()
  })
  .transform((table) => {
    const inc = table.LtcChange.find((i) => i.status === 'increment')
    const end = table.LtcChange.find((i) => i.status === 'end')
    const fps = table.tcFps

    if (!inc || !end || !fps) {
      return {
        start: undefined,
        end: undefined,
        duration: undefined,
        fps: undefined
      }
    }

    return {
      start: parseTimecode(inc.value),
      end: parseTimecode(end.value),
      duration: format.framesToTimecode(end.frameCount + 1, fps), // +1 to force inclusive frame count
      fps
    }
  })

const VideoFrameSchema = z
  .object({
    videoCodec: z.string(),
    captureFps: z.string().optional(),
    formatFps: z.string().optional()
  })
  .transform((frame) => {
    return {
      codec: extractCodec(frame.videoCodec),
      captureFps: frame.captureFps ? Number(frame.captureFps.replace('p', '')) : undefined,
      formatFps: frame.formatFps ? Number(frame.formatFps.replace('p', '')) : undefined
    }
  })

const VideoLayoutSchema = z
  .object({
    numOfVerticalLine: z.string(),
    pixel: z.string()
  })
  .transform((table) => {
    const width = table.pixel
    const height = table.numOfVerticalLine
    return {
      resolution: `${width}x${height}`
    }
  })

const VideoFormatSchema = z.object({
  VideoFrame: VideoFrameSchema,
  VideoLayout: VideoLayoutSchema
})

const AcquisitionItemSchema = z.object({
  name: z.string(),
  value: z.string()
})

const AcquisitionGroupSchema = z.object({
  Item: z
    .union([z.array(AcquisitionItemSchema), AcquisitionItemSchema])
    .transform((it) => (Array.isArray(it) ? it : [it])),
  name: z.string()
})

const DeviceSchema = z
  .object({
    modelName: z.string().optional()
  })
  .transform((device) => {
    return {
      camera_model: mapSonyModel(device.modelName) || 'Sony'
    }
  })

const AcquisitionRecordSchema = z
  .object({
    Group: z.array(AcquisitionGroupSchema)
  })
  .transform((rec) => {
    return rec.Group.reduce<Record<string, Record<string, string>>>((acc, group) => {
      acc[group.name] = Object.fromEntries(group.Item.map((item) => [item.name, item.value]))
      return acc
    }, {})
  })

const NonRealTimeMetaSchema = z.object({
  LtcChangeTable: LtcChangeTableSchema,
  VideoFormat: VideoFormatSchema,
  Device: DeviceSchema.optional(),
  AcquisitionRecord: AcquisitionRecordSchema,
  xmlns: z.string(),
  'xmlns:lib': z.string()
})

export const VeniceXmlZod = z.object({
  '?xml': XmlSchema,
  NonRealTimeMeta: NonRealTimeMetaSchema
})

export const VeniceNamespaceSchema = z.object({
  NonRealTimeMeta: z.object({
    xmlns: z.string().startsWith('urn:schemas-professionalDisc:nonRealTimeMeta')
  })
})

export const VeniceMetaSchema = z.tuple([VeniceXmlZod, z.string()]).transform(([xml, file]) => {
  const { start, end, duration } = xml.NonRealTimeMeta.LtcChangeTable
  const { codec, formatFps, captureFps } = xml.NonRealTimeMeta.VideoFormat.VideoFrame
  const { resolution } = xml.NonRealTimeMeta.VideoFormat.VideoLayout
  const { camera_model = 'Sony' } = xml.NonRealTimeMeta.Device || {}
  const groups = xml.NonRealTimeMeta.AcquisitionRecord
  const cam = groups['CameraUnitMetadataSet'] || {}
  const lensGroup = groups['LensUnitMetadataSet'] || {}
  const sony = groups['SonyF65CameraMetadataSet'] || {}

  const obj: Partial<CameraMetadataType> = {
    clip: path.parse(file).name.slice(0, -3),
    tc_start: start,
    tc_end: end,
    duration,
    fps: formatFps,
    camera_model,
    reel: path.basename(file, '.xml').slice(0, 4),
    sensor_fps: captureFps,
    ei: toNumber(cam['ExposureIndexOfPhotoMeter']),
    wb: toNumber(cam['WhiteBalance']),
    tint: cam['TintCorrection'],
    shutter: parseShutterAngle(cam['ShutterSpeed_Angle'] || cam['ShutterSpeedAngle']),
    lens: lensGroup['LensZoomActualFocalLength'],
    lut: sony['PreCDLTransform']?.split(':').pop(),
    gamma: sony['GammaForLook'],
    codec,
    resolution
  }
  const cleaned = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null))
  return CameraMetadataZod.parse(cleaned)
})
