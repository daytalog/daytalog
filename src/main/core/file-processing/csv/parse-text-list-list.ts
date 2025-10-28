import type { TextListListFieldType } from 'daytalog'
/**
 * Parses a string representing multiple records into an array of field arrays.
 *
 * @param field - The list of field arrays configuration.
 * @param row - The input data row.
 * @param dataRow - The output data row to populate.
 * @returns An array of field arrays.
 *
 * @example
 * // input: "Johnny|Bravo|Gaffer|Frequently uses a flashlight to check if lights are on,Jane|Doe|Video Assist|Brings 500ft of BNC but always ends up 3ft short"
 * // output:
 * // [
 * //   ['Johnny', 'Bravo', 'Gaffer', 'Frequently uses a flashlight to check if lights are on'],
 * //   ['Jane', 'Doe', 'Video Assist', 'Brings 500ft of BNC but always ends up 3ft short']
 * // ]
 */
export function parseTextListList(field: TextListListFieldType, value: string): string[][] {
  const { primary_delimiter = ',', secondary_delimiter = '|' } = field
  // Split the input string into records using the record delimiter
  const records = value.split(primary_delimiter)

  // Map each record to an array of fields
  const result: string[][] = records.map((record) => {
    // Trim the record to remove leading/trailing whitespace
    record = record.trim()

    // Split the record into fields using the field delimiter
    const fields = record.split(secondary_delimiter).map((field) => field.trim())

    return fields
  })

  return result
}
