import type { LogType } from 'daytalog'
import { ProjectRootType } from '@shared/core/project-types'

export function getLatestLog(logs: LogType[], project: ProjectRootType): LogType {
  if (!logs.length) throw new Error('no logs')

  const maxDay = Math.max(...logs.map((log) => log.day))

  const latestEntries = logs.filter((log) => log.day === maxDay)

  if (project.unit && latestEntries.length > 1) {
    const matchingUnitEntries = latestEntries.filter((log) => log.unit === project.unit)
    if (matchingUnitEntries.length === 1) return matchingUnitEntries[0]
  }
  return latestEntries[0]
}

export const getFirstAndLastDaytalogs = (
  daytalogs: LogType[]
): { first: LogType; last: LogType } => {
  if (!daytalogs.length) throw new Error('No daytalogs provided')

  const sorted = [...daytalogs].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    if (a.day !== b.day) return a.day - b.day
    const unitA = a.unit || ''
    const unitB = b.unit || ''
    return unitA.localeCompare(unitB)
  })

  return { first: sorted[0], last: sorted[sorted.length - 1] }
}
