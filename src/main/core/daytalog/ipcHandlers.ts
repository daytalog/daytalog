import { ipcMain, dialog } from 'electron'
import type {
  ResponseWithClips,
  ResponseWithClipsAndPaths,
  CheckPathsResult,
  PathType,
  GetClipsParams,
  RemoveClipsParams
} from '@shared/core/shared-types'
import type { LogType } from 'daytalog'
import { Response } from '@shared/core/shared-types'
import { spawnWorker } from './builder/workers/workerManager'
import addDefaults from './builder/add-defaults'
import checkPaths from './builder/check-paths'
import { removeOcf, removeSound } from './builder/remove'
import updateDaytalog from './updater'
import deleteDaytalog from './delete'
import { createSendWindow } from '@core-windows/send/sendWindow'
import logger from '@core-logger'
import { appState, daytalogs } from '../app-state/state'
import { ActiveLogPathType } from '@shared/core/shared-types'
import { ProjectType } from '@shared/core/project-types'

export function setupDaytalogIpcHandlers(): void {
  ;(ipcMain.handle('checkPaths', async (_, paths: PathType): Promise<CheckPathsResult> => {
    return await checkPaths(paths)
  }),
    ipcMain.handle('getDefaultClips', async (_, paths: PathType): Promise<ResponseWithClips> => {
      return await addDefaults(paths)
    }))
  ipcMain.handle(
    'getClips',
    async (_, params: GetClipsParams): Promise<ResponseWithClipsAndPaths> => {
      const { type, storedClips, customSchema, refreshPath } = params
      let paths: string[] | null = refreshPath && refreshPath.trim() ? [refreshPath] : null
      if (!paths) {
        if (type === 'custom') {
          const csvdialog = await dialog.showOpenDialog({
            title: 'Select a CSV file',
            filters: [{ name: 'CSV Files', extensions: ['csv'] }],
            properties: ['openFile']
          })
          if (csvdialog.canceled)
            return { success: false, error: 'User cancelled', cancelled: true }
          paths = csvdialog.filePaths
        } else {
          const dialogResult = await dialog.showOpenDialog({ properties: ['openDirectory'] })
          if (dialogResult.canceled)
            return { success: false, error: 'User cancelled', cancelled: true }
          paths = dialogResult.filePaths
        }
      }
      if (!paths) {
        return { success: false, error: 'No valid path selected' }
      }

      let scriptName = ''
      let responsePaths: PathType = {
        ocf: null,
        sound: null,
        proxy: null
      }
      switch (type) {
        case 'ocf':
          scriptName = 'addOCFWorker'
          responsePaths.ocf = paths
          break
        case 'sound':
          scriptName = 'addSoundWorker'
          responsePaths.sound = paths
          break
        case 'proxy':
          scriptName = 'addProxyWorker'
          responsePaths.proxy = paths
          break
        case 'custom':
          scriptName = 'addCustomWorker'
          break
        default:
          return { success: false, error: `Unknown type: ${type}` }
      }

      try {
        if (type === 'proxy' && storedClips.length === 0) {
          logger.debug('No ocf clips to match proxies with returning paths', scriptName)
          return { success: true, clips: { proxy: [] }, paths: responsePaths }
        }
        logger.debug('spawning:', scriptName)
        const { promise } = spawnWorker(scriptName, { paths, storedClips, customSchema })

        const result = await promise
        if (result.success) {
          return { ...result, paths: responsePaths }
        } else {
          return result
        }
      } catch (error) {
        logger.error(error?.toString())
        return { success: false, error: String(error) }
      }
    }
  )

  ipcMain.handle(
    'removeClips',
    async (_, params: RemoveClipsParams): Promise<ResponseWithClips> => {
      const { paths, type, storedClips } = params
      switch (type) {
        case 'ocf':
          return await removeOcf(paths, storedClips)
        case 'sound':
          return await removeSound(paths, storedClips)
        default:
          throw new Error(`Unknown type: ${type}`)
      }
    }
  )

  ipcMain.handle(
    'update-daytalog',
    async (
      _,
      daytalog: LogType,
      paths: ActiveLogPathType,
      oldDaytalog?: LogType
    ): Promise<Response> => {
      return await updateDaytalog(daytalog, paths, oldDaytalog)
    }
  )

  ipcMain.handle('delete-daytalog', async (_, daytalog: LogType): Promise<Response> => {
    return await deleteDaytalog(daytalog)
  })

  ipcMain.on('open-send-window', (_, selection: string[]) => {
    createSendWindow(null, selection)
  })

  ipcMain.handle('get-project', (): ProjectType => {
    return appState.project
  })

  ipcMain.handle('get-daytalogs', (): LogType[] => {
    return Array.from(daytalogs().values())
  })
}
