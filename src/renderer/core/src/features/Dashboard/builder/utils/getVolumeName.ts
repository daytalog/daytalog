export function parseVolumePath(filePath: string): [string, string] {
  if (filePath.startsWith('/Volumes/')) {
    const parts = filePath.split('/')
    if (parts.length > 2) {
      const volume = parts[2]
      const rest = parts.length > 3 ? '/' + parts.slice(3).join('/') : ''
      return [volume, rest ? rest + '/' : '/']
    }
    // If path is just '/Volumes/' or malformed, return as-is
    return [filePath, '']
  } else {
    const parts = filePath.split('/')
    if (parts.length > 1) {
      switch (parts[1]) {
        case 'Users':
        case 'Applications':
        case 'System':
        case 'Library':
          const volume = 'Macintosh HD'
          const rest = parts.slice(2).join('/')
          return [volume, rest ? '/' + rest + '/' : '/']
        default:
          // For other paths, return the path as volume and empty rest
          const defaultVolume = filePath.startsWith('/') ? filePath.slice(1) : filePath
          return [defaultVolume, '']
      }
    }
  }

  // Default: return the path as volume and empty rest
  const defaultVolume = filePath.startsWith('/') ? filePath.slice(1) : filePath
  return [defaultVolume, '']
}

export function getVolumeName(filePath: string): string {
  return parseVolumePath(filePath)[0]
}

export function getFormattedPath(filePath: string): string {
  return parseVolumePath(filePath)[1]
}
