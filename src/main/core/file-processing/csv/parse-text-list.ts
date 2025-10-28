import type { TextListFieldType } from 'daytalog'

// Function to escape special regex characters
function escapeRegExp(s: string): string {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Parses a delimited string into a list of strings.
 *
 * @param field - The list of strings field configuration.
 * @param row - The input data row.
 * @returns The array of trimmed strings.
 *
 * @example
 * // input: "applebox,boom,clapperboard"
 * // output: ['applebox', 'boom', 'clapperboard']
 */
export function parseTextList(field: TextListFieldType, row: any): string[] {
  const { column, delimiter } = field
  const value = row[column!] ?? ''

  if (delimiter !== undefined) {
    return value.split(delimiter).map((item: string) => item.trim())
  } else {
    // Define common separators
    const separators = [',', ';', '|', '\t', ' ', ':']

    // Count occurrences of each separator
    const counts: { [key: string]: number } = {}
    for (const sep of separators) {
      const regex = new RegExp(escapeRegExp(sep), 'g')
      const matches = value.match(regex)
      counts[sep] = matches ? matches.length : 0
    }

    // Find the separator with the maximum count
    let maxCount = 0
    let maxSeparator = ''
    for (const sep of separators) {
      if (counts[sep] > maxCount) {
        maxCount = counts[sep]
        maxSeparator = sep
      }
    }

    // If no separator is found, return the original string in an array
    if (maxCount === 0) {
      return [value]
    } else {
      return value.split(maxSeparator).map((item: string) => item.trim())
    }
  }
}
