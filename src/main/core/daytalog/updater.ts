import fs from 'fs/promises'
import path from 'path'
import YAML from 'yaml'
import logger from '@core-logger'
import { appState } from '../app-state/state'
import type { LogType } from 'daytalog'
import { Response, ActiveLogPathType, ActiveLogType } from '@shared/core/shared-types'
import { ensureDirectoryExists, fileExists } from '../utils/crud'
import { dialog } from 'electron'
import deleteDaytalog from './delete'
import { updateState } from '../app-state/updater'
import menuManager from '../menu'
import { areActiveLogsEqual } from './utils/compareActiveLogs'

export const updateActiveLog = async (activeLog: ActiveLogType | null) => {
  const project = appState.project
  if (!project) throw new Error('No project')

  const currentActiveLog = appState.config.activeLog
  const hasChanged = !areActiveLogsEqual(currentActiveLog, activeLog)

  if (hasChanged) {
    project.activeLog = activeLog
    appState.project = project
    await updateState({ activeProject: appState.config.activeProject, activeLog: activeLog })
  }

  menuManager.createOrUpdateTray()
}

const updateDaytalog = async (
  data: LogType,
  paths: ActiveLogPathType,
  oldDaytalog?: LogType
): Promise<Response> => {
  try {
    const activeProjectPath = appState.config.activeProject
    if (!activeProjectPath) throw new Error('No active project')
    await ensureDirectoryExists(path.join(activeProjectPath, 'logs'))
    const { id, ...rest } = data
    const yaml = YAML.stringify({ ...rest, version: 1 })
    const filepath = path.join(activeProjectPath, 'logs', `${id}.dayta`)
    const file = await fileExists(filepath)
    if (file && !oldDaytalog) {
      const response = dialog.showMessageBoxSync({
        type: 'question',
        title: 'Overwrite Confirmation',
        message: `The file ${path.basename(filepath)} already exists. Do you want to overwrite it?`,
        buttons: ['Overwrite', 'Cancel'],
        defaultId: 1,
        cancelId: 1
      })
      if (response !== 0) {
        return { success: false, error: 'User canceled the overwrite.', cancelled: true }
      }
    }
    await fs.writeFile(filepath, yaml, 'utf8')

    if (oldDaytalog && oldDaytalog.id !== id) {
      await deleteDaytalog(oldDaytalog)
    } else {
      await updateActiveLog({ id, paths })
    }
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error(message)
    logger.error(`Error saving/updating log: ${message}`)
    return { success: false, error: message }
  }
}

export default updateDaytalog
