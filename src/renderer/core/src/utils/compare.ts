/**
 * Compares an original size (in bytes) with a user‐provided input size in TB, GB, or MB.
 * The comparison uses a tolerance that is always rounded to three decimals.
 *
 * For each unit, we use a relative tolerance of 0.1% of the original size
 * but ensure a minimum tolerance of 0.001 in that unit.
 *
 * Examples:
 *  - For 142086897664 bytes in GB (≈142.0869 GB), the relative tolerance is 0.142,
 *    so comparing to an input of 142 GB returns true.
 *  - For 142086897664 bytes in TB (≈0.142087 TB), the computed relative tolerance is
 *    0.000142, but the minimum 0.001 TB is used. Comparing 0.142 TB returns true.
 *
 * @param originalBytes - The original size in bytes.
 * @param inputSize - The user input in the specified unit.
 * @param inputUnit - The unit of the input size ('tb', 'gb', or 'mb').
 * @returns true if the values match within the computed tolerance.
 */
export function compareSizes(
  originalBytes: number,
  inputSize: number,
  inputUnit: 'tb' | 'gb' | 'mb'
): boolean {
  const conversionFactors = { tb: 1e12, gb: 1e9, mb: 1e6 }
  const factor = conversionFactors[inputUnit]

  // Convert original bytes into the provided unit.
  const originalInUnit = originalBytes / factor

  // Compute a relative tolerance of 0.1% (0.001) of the original value.
  // Ensure a minimum tolerance of 0.001 in the given unit.
  const computedTolerance = Math.max(originalInUnit * 0.001, 0.001)

  // Round the tolerance to three decimals.
  const tolerance = Math.round(computedTolerance * 1000) / 1000

  return Math.abs(originalInUnit - inputSize) <= tolerance
}
