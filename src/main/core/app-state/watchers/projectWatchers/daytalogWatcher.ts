import chokidar, { FSWatcher } from 'chokidar'
import { daytalogs, appState } from '../../state'
import { loadDaytalog } from '../../../daytalog/loader'
import logger from '@core-logger'
import { getDaytalogWindow } from '@core-windows/dashboard/dashboardWindow'
import { ensureDirectoryExists } from '../../../utils/crud'
import trayManager from '../../../menu'
import { createErrorWindow } from '@core-windows/error/errorWindow'

let daytalogsWatcher: FSWatcher | null = null

let debouncedUpdate: NodeJS.Timeout | null = null
let debouncedErrorUpdate: NodeJS.Timeout | null = null
let collectedErrors: string[] = []

export const initDaytalogWatcher = async () => {
  const projectPath = appState.config.activeProject
  if (!projectPath) throw new Error('Project path not found in initDaytalogWatcher')

  const watchPattern = `${projectPath}/logs/`

  await ensureDirectoryExists(watchPattern)

  daytalogsWatcher = chokidar.watch(watchPattern, {
    ignored: (file, stats): boolean => !!stats?.isFile() && !file.endsWith('.dayta'),
    persistent: true
  })

  daytalogsWatcher.on('ready', () => {
    logger.debug('daytalogsWatcher started')
  })
  daytalogsWatcher.on('error', (error) => logger.error('daytalogsWatcher error:', error))

  daytalogsWatcher.on('all', (event, filepath) => {
    logger.debug(`Event: ${event}, File: ${filepath}`)
  })

  daytalogsWatcher.on('add', async (filepath) => {
    logger.debug(`Parsing daytalog for file: ${filepath}`)
    try {
      const daytalog = await loadDaytalog(filepath)
      logger.debug(`Parsed daytalog: ${filepath}`)
      daytalogs().set(filepath, daytalog)
      logger.debug(`File added during initialization: ${filepath}`)
      debounceIpcUpdate()
    } catch (error) {
      const errorMessage = `${error instanceof Error ? error.message : String(error)}`
      logger.error(`daytalogWatcher add error (${filepath}):`, error)
      collectedErrors.push(errorMessage)
      debounceErrorUpdate()
    }
  })

  daytalogsWatcher.on('change', async (filepath) => {
    try {
      const daytalog = await loadDaytalog(filepath)
      daytalogs().set(filepath, daytalog)
      debounceIpcUpdate()
    } catch (error) {
      const errorMessage = `${error instanceof Error ? error.message : String(error)}`
      logger.error(`daytalogWatcher change error (${filepath}):`, error)
      daytalogs().delete(filepath)
      debounceIpcUpdate()
      collectedErrors.push(errorMessage)
      debounceErrorUpdate()
    }
  })

  daytalogsWatcher.on('unlink', (filepath) => {
    daytalogs().delete(filepath)
    debounceIpcUpdate()
  })
}

const debounceIpcUpdate = () => {
  if (debouncedUpdate) clearTimeout(debouncedUpdate)

  debouncedUpdate = setTimeout(() => {
    debouncedUpdate = null
    sendIpcUpdate()
  }, 300)
}

const debounceErrorUpdate = () => {
  if (debouncedErrorUpdate) clearTimeout(debouncedErrorUpdate)

  debouncedErrorUpdate = setTimeout(() => {
    debouncedErrorUpdate = null
    showErrorWindow()
  }, 1000) // Wait 1 second to collect multiple errors
}

// Function to send IPC update
const sendIpcUpdate = async () => {
  trayManager.createOrUpdateTray()
  const allDaytalogs = Array.from(daytalogs().values())
  const mainWindow = await getDaytalogWindow()
  if (mainWindow) {
    mainWindow.webContents.send('daytalogs-loaded', allDaytalogs)
  }
}

// Function to show error window with collected errors
const showErrorWindow = () => {
  if (collectedErrors.length > 0) {
    const errorMessage = collectedErrors.join('\n\n')
    createErrorWindow(errorMessage)
    collectedErrors = [] // Clear errors after showing
  }
}

export const closeDaytalogsWatcher = async () => {
  if (daytalogsWatcher) {
    try {
      logger.debug('Closing daytalogsWatcher...')
      await daytalogsWatcher.close()
      logger.debug('daytalogsWatcher closed successfully.')
    } catch (error) {
      logger.error('Error closing daytalogsWatcher:', error)
    } finally {
      daytalogsWatcher = null
      daytalogs().clear()
      collectedErrors = [] // Clear collected errors
    }
  } else {
    logger.debug('daytalogsWatcher is already closed or was never initialized.')
  }
}
