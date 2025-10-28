import type { LogType } from 'daytalog'

export function getNextDay(logs: LogType[]): number {
  let highestDay = logs[0].day

  for (const log of logs) {
    if (log.day > highestDay) {
      highestDay = log.day
    }
  }
  return highestDay + 1
}
