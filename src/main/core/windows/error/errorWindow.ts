import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { setErrorMessage } from './ipcHandlers'

let errorWindow: BrowserWindow | null

export function createErrorWindow(errorMessage?: string) {
  if (errorMessage) {
    setErrorMessage(errorMessage)
  }

  if (errorWindow) {
    errorWindow.focus()
    // Update the error message if provided
    if (errorMessage) {
      errorWindow.webContents.send('error-message-updated', errorMessage)
    }
    return
  }

  errorWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    transparent: true,
    backgroundColor: '#00000000',
    visualEffectState: 'active',
    vibrancy: 'hud',
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/error-preload.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  errorWindow.on('ready-to-show', () => {
    errorWindow?.show()
    // Send the error message to the renderer
    if (errorMessage) {
      errorWindow?.webContents.send('error-message-updated', errorMessage)
    }
  })

  errorWindow.on('close', () => {
    errorWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    errorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/core/error.html`)
  } else {
    errorWindow.loadFile(join(__dirname, '../renderer/core/error.html'))
  }
}
