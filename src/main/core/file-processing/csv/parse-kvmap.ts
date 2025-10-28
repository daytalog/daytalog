import type { KvMapFieldType } from 'daytalog'
/**
 * Parses a key-value string into an object.
 *
 * @param field - The key-value object field configuration.
 * @param row - The input data row.
 * @param dataRow - The output data row to populate.
 * @returns The resulting key-value object.
 *
 * @example
 * // input: "Location:Studio 1;UserInfo1:bananas, oat milk, 12 eggs, avocados (ripe, but not too ripe);"
 * // output:
 * // {
 * //   Location: 'Studio 1',
 * //   UserInfo1: 'bananas, oat milk, 12 eggs, avocados (ripe, but not too ripe)'
 * // }
 */
export function parseKV(field: KvMapFieldType, value: string): { [key: string]: string } {
  const { primary_delimiter = ';', secondary_delimiter = ':' } = field

  const result: { [key: string]: string } = {}
  const pairs = value.split(primary_delimiter)

  for (const pair of pairs) {
    if (pair.trim() === '') {
      continue // Skip empty pairs resulting from trailing semicolons
    }

    const [key, value] = pair.split(secondary_delimiter, 2).map((s) => s.trim())

    if (key) {
      result[key] = value !== undefined && value !== '' ? value : ''
    }
  }
  return result
}
