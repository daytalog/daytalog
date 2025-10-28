import type { ResponseWithClips } from '@shared/core/shared-types'
import type { CustomType, OcfClipType, CustomSchemaType } from 'daytalog'
import { CameraMetadataEnumZod, CustomSchema } from 'daytalog'
import fs from 'fs'
import Papa from 'papaparse'
import chardet from 'chardet'
import iconv from 'iconv-lite'
import * as z from 'zod'
import { parseTextList } from '../../file-processing/csv/parse-text-list'
import { parseTextListList } from '../../file-processing/csv/parse-text-list-list'
import { parseKV } from '../../file-processing/csv/parse-kvmap'
import { parseKVList } from '../../file-processing/csv/parse-kvmap-list'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface addCustomProps {
  paths: string | string[]
  storedClips: OcfClipType[]
  customSchema: CustomSchemaType
}

const addCustom = async ({
  paths,
  storedClips: _storedClips,
  customSchema
}: addCustomProps): Promise<ResponseWithClips> => {
  try {
    //const store = new Map<string, OcfClipType>(storedClips.map((clip) => [clip.clip, clip]))
    const path = Array.isArray(paths) ? paths[0] : paths
    if (!customSchema) {
      const message = `No schema provided`
      console.warn(message)
      return {
        success: false,
        error: message
      }
    }
    console.log(customSchema)

    if (!customSchema?.log_fields && !customSchema?.clip_fields?.length) {
      const message = `Log and Clip fields in ${customSchema.id}-schema are empty`
      console.warn(message)
      return {
        success: false,
        error: message
      }
    }

    /*if (
      !Array.isArray(custom_fields?.fields) ||
      custom_fields.fields.length === 0 ||
      !custom_fields.fields.every((field) => typeof field === 'object' && field !== null)
    ) {
      const message = 'Settings fields is empty or does not contain valid objects'
      console.warn(message)
      return {
        success: false,
        error: message
      }
    }*/

    // Check file size
    const stats = await fs.promises.stat(path)
    if (stats.size > MAX_FILE_SIZE) {
      const message = 'CSV file is too large'
      console.warn(message)
      return { success: false, error: message }
    }

    // Read the file as a buffer
    const buffer = await fs.promises.readFile(path)

    // Detect the encoding
    const detectedEncoding = chardet.detect(buffer) || 'utf8'

    // Decode the buffer using iconv-lite
    const data = iconv.decode(buffer, detectedEncoding)

    // Parse the CSV data
    const parsed = await new Promise<Papa.ParseResult>((resolve, reject) => {
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult) => resolve(results),
        error: (err: Error) => reject(err)
      })
    })

    const log = new Map<string, Record<string, unknown>[]>()
    const clips: Record<string, unknown>[] = []

    let rowIndex = 0
    for (const row of parsed.data) {
      const rawLog: Record<string, unknown> = {}
      const rawClip: Record<string, unknown> = {}

      /*let clipcolumn: string | undefined = row[custom_fields.clip.column]
      if (!clipcolumn) continue

      // Use the pre-compiled clip regex, if available
      clipRegex && (clipcolumn = parseString(clipcolumn, clipRegex))

      const matchingOcfClip = store.get(clipcolumn)
      if (!matchingOcfClip) continue*/

      for (const field of customSchema.log_fields ?? []) {
        if (!field.column) continue
        const value = row[field.column] ?? ''

        switch (field.type) {
          case 'text':
            rawLog[field.key_name] = value
            break
          case 'text_list':
            rawLog[field.key_name] = parseTextList(field, value)
            break
          case 'text_list_list':
            rawLog[field.key_name] = parseTextListList(field, value)
            break
          case 'kv_map':
            rawLog[field.key_name] = parseKV(field, value)
            break
          case 'kv_map_list':
            rawLog[field.key_name] = parseKVList(field, value)
            break
          default:
            break
        }
      }

      for (const field of customSchema.clip_fields ?? []) {
        if (!field.column) continue
        const value = row[field.column] ?? ''

        switch (field.type) {
          case 'text':
            rawClip[field.key_name] = value
            break
          case 'text_list':
            rawClip[field.key_name] = parseTextList(field, value)
            break
          case 'text_list_list':
            rawClip[field.key_name] = parseTextListList(field, value)
            break
          case 'kv_map':
            rawClip[field.key_name] = parseKV(field, value)
            break
          case 'kv_map_list':
            rawClip[field.key_name] = parseKVList(field, value)
            break
          default:
            if (CameraMetadataEnumZod.options.includes(field.type)) {
              rawClip[field.type] = value
            }
            break
        }
      }

      log[rowIndex] = rawLog
      clips.push(rawClip)
      rowIndex++
    }

    const logObj = Object.fromEntries(log)
    const schemaToValidate: Record<string, unknown> = { schema: customSchema.id }
    if (Object.keys(logObj).length) {
      schemaToValidate.log = logObj
    }
    if (clips.length) {
      schemaToValidate.clips = clips
    }
    //console.log('toVal:', schemaToValidate)
    const res = CustomSchema(customSchema).safeParse(schemaToValidate)

    if (res.success) {
      return { success: true, clips: { custom: res.data as CustomType } }
    } else {
      throw new Error(z.prettifyError(res.error))
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(message)
    return { success: false, error: message }
  }
}

export default addCustom
