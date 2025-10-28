import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { state, error } from './types'
import { ActiveLogType } from '@shared/core/shared-types'
import { appState } from './state'
import logger from '@core-logger'

interface updateProps {
  activeProject: string | null
  activeLog: ActiveLogType | null
}

async function saveStateToFile(data: state): Promise<error | undefined> {
  try {
    const filePath = path.join(app.getPath('userData'), 'appconfig.json')
    //const encryptedData = safeStorage.encryptString(JSON.stringify(data)) // Removed safe storage, we don't store any secrets anyway.
    const json = JSON.stringify(data)
    fs.writeFileSync(filePath, json, 'utf8')
    return
  } catch (error) {
    return { error: true, message: 'Failed to write or encrypt the file' }
  }
}

export async function updateState({ activeProject, activeLog }: updateProps): Promise<void> {
  logger.debug('update state started')
  try {
    appState.config = { activeProject, activeLog }
    await saveStateToFile({ activeProject, activeLog })
    logger.debug(`State updated. Project: ${activeProject}, Active log: ${activeLog?.id ?? 'none'}`)
  } catch (error) {
    logger.error('Error in updateState: ', error)
  }
}
