import logger from '../utils/logger'
import type { LogType } from 'daytalog'
import { appState } from '../app-state/state'
import { parseLog } from 'daytalog/parse'

export const loadDaytalog = async (filePath: string): Promise<LogType> => {
  const project = appState.project
  if (!project) throw new Error('No active project found')
  try {
    return await parseLog(filePath, project)
  } catch (error) {
    let message = error instanceof Error ? error.message : 'An unknown error occurred.'

    if (message.startsWith('Validation failed for')) {
      const daytaIndex = message.indexOf('.dayta')
      if (daytaIndex !== -1) {
        const beforeDayta = message.substring(0, daytaIndex)
        const lastSlashIndex = beforeDayta.lastIndexOf('/')
        if (lastSlashIndex !== -1) {
          message = message.substring(lastSlashIndex + 1)
        }
      }
    }
    logger.error(`Error loading log at ${filePath}: ${message}`)
    throw new Error(message)
  }
}
