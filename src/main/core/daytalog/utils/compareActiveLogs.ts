import { ActiveLogPathType, ActiveLogType } from '@shared/core/shared-types'

const areArraysEqual = (a: string[] | null, b: string[] | null): boolean => {
  if (a === null && b === null) return true
  if (a === null || b === null) return false
  if (a.length !== b.length) return false

  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, idx) => val === sortedB[idx])
}

const arePathsEqual = (paths1: ActiveLogPathType, paths2: ActiveLogPathType): boolean => {
  if (paths1 === null && paths2 === null) return true
  if (paths1 === null || paths2 === null) return false
  return (
    areArraysEqual(paths1.ocf, paths2.ocf) &&
    areArraysEqual(paths1.sound, paths2.sound) &&
    areArraysEqual(paths1.proxy, paths2.proxy)
  )
}

export const areActiveLogsEqual = (
  log1: ActiveLogType | null,
  log2: ActiveLogType | null
): boolean => {
  if (log1 === null && log2 === null) return true
  if (log1 === null || log2 === null) return false
  if (log1.id !== log2.id) return false
  return arePathsEqual(log1.paths, log2.paths)
}
