import type { KvMapListFieldType } from 'daytalog'
/**
 * Parses a string containing multiple records into an array of mapped objects.
 *
 * @param field - The list of mapped objects field configuration.
 * @param value - The input string containing multiple records.
 * @returns An array of objects mapping subfield keys to their values.
 *
 * @example
 * // input: "25:25:25.25|0|Operator fell asleep. Shot turned into 20 minutes of clouds,01:23:45.67|5|Camera overheated from director’s 99th retake of actor pouring coffee. Director still not satisfied"
 * // output:
 * // [
 * //   {
 * //     TC: '25:25:25.25',
 * //     urgency: '0',
 * //     issue: 'Operator fell asleep. Shot turned into 20 minutes of clouds'
 * //   },
 * //   {
 * //     TC: '01:23:45.67',
 * //     urgency: '5',
 * //     issue: 'Camera overheated from director’s 99th retake of actor pouring coffee. Director still not satisfied'
 * //   }
 * // ]
 */
export function parseKVList(field: KvMapListFieldType, value: string): Record<string, string>[] {
  const { subfields, primary_delimiter = ',', secondary_delimiter = '|' } = field
  if (!value.trim() || subfields.length === 0) return []

  const fieldMapping = subfields.map((sub) => sub.key_name)

  const records = value.split(primary_delimiter)

  const result: Record<string, string>[] = []

  for (const record of records) {
    const fields = record.split(secondary_delimiter).map((f) => f.trim())
    if (fields.every((f) => f === '')) continue

    const mappedObject: Record<string, string> = {}
    fields.forEach((fieldValue, index) => {
      const key = fieldMapping[index]
      if (key) {
        mappedObject[key] = fieldValue
      }
    })
    if (Object.keys(mappedObject).length > 0) {
      result.push(mappedObject)
    }
  }
  return result
}
