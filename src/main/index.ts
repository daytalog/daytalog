import { app, BrowserWindow, session, ipcMain, nativeImage } from 'electron'
import { autoUpdater } from 'electron-updater'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '@resources/appIconlight.png?asset'
import { loadState } from './core/app-state/loader'
import { setupIpcHandlers } from './setupIpcHandlers'
import { closeAllWatchers } from './core/app-state/watchers/closing'
import logger from '@core-logger'
import trayManager from './core/menu'
import { startLocalServer, stopLocalServer } from './core/server/apiServer'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { checkForUpdates } from '@adapter'

autoUpdater.autoDownload = false

// Initialize the application
app.setName('Daytalog')

app.commandLine.appendSwitch('disable-features', 'OverlayScrollbar')

if (is.dev) {
  autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  session.defaultSession.clearCache()
  electronApp.setAppUserModelId('com.daytalog')
  app.dock?.setIcon(nativeImage.createFromPath(icon))

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()
  await loadState()
  await startLocalServer()
  trayManager.createOrUpdateTray()
  checkForUpdates()
})

app.on('window-all-closed', () => {
  // DO NOTHING. ELSE I WILL QUIT
})

process.on('SIGINT', async () => {
  logger.debug('SIGINT received. Shutting down...')
  app.quit()
})

process.on('SIGTERM', async () => {
  logger.debug('SIGTERM received. Shutting down...')
  app.quit()
})

const flushWinstonLogs = async (): Promise<void> => {
  return new Promise((resolve) => {
    logger.on('finish', resolve) // Resolves when all logs are flushed
    logger.end() // Ends the logger and flushes all pending logs
  })
}

app.on('will-quit', async (event) => {
  event.preventDefault()
  try {
    logger.debug('App is quitting. Performing cleanup...')
    BrowserWindow.getAllWindows().forEach((win) => win.destroy())
    trayManager.destroyTray()

    try {
      await stopLocalServer()
      logger.debug('Local server closed.')
    } catch (err) {
      console.error('Error closing API server:', err)
    }

    await closeAllWatchers()
    ipcMain.removeAllListeners()

    // Flush logs after watchers close
    await flushWinstonLogs()
    console.log('Cleanup complete. Quitting app.')
  } catch (error) {
    console.error('Error during app quit cleanup:', error)
  } finally {
    app.exit()
  }
})
