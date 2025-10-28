export function supportsSubLabel() {
  const version = process.getSystemVersion() // e.g. "14.4.4"
  const [major, minor] = version.split('.').map(Number)
  return major > 14 || (major === 14 && minor >= 4)
}
