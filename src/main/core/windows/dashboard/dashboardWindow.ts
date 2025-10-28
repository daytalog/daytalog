import { BrowserWindow, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import icon from '@resources/appIconlight.png?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { openWindow } from '../../utils/open-window'
import { appState, daytalogs } from '../../app-state/state'

let mainWindow: BrowserWindow | null = null

interface getDaytalogWindowProps {
  update?: boolean
  ensureOpen?: boolean
  navigate?: 'builder' | 'settings' | 'new-project'
  builderId?: string
}

// Getter function to access mainWindow
export async function getDaytalogWindow({
  update,
  ensureOpen,
  navigate,
  builderId
}: getDaytalogWindowProps = {}): Promise<BrowserWindow | null> {
  if (!mainWindow && (ensureOpen || navigate))
    await createWindow(builderId ? `builder/${builderId}` : navigate)

  if (mainWindow) {
    const handleActions = () => {
      if (navigate) {
        switch (navigate) {
          case 'builder':
            mainWindow?.webContents.send('open-builder', builderId ?? null)
            break
          case 'settings':
            mainWindow?.webContents.send('open-settings')
            break
          case 'new-project':
            mainWindow?.webContents.send('open-new-project')
            break
          default:
            // Optionally handle unknown navigate values
            console.warn(`Unknown navigate value: ${navigate}`)
        }
      }
      if (update) {
        mainWindow?.webContents.send('project-loaded', appState.project)
        mainWindow?.webContents.send('daytalogs-loaded', Array.from(daytalogs().values()))
      }

      if (mainWindow && (ensureOpen || navigate)) openWindow(mainWindow)
    }
    if (!mainWindow.webContents.isLoading()) handleActions()
  }
  return mainWindow
}

// Function to create the main window
async function createWindow(route: string = '/'): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1040,
    minHeight: 400,
    backgroundColor: 'rgb(9,9,11)',
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/dash-preload.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    //mainWindow && mainWindow.webContents.openDevTools({ mode: 'detach' })
    mainWindow && mainWindow.show() // Show the window when it's ready to be shown
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  let url: string
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    // Dev server (e.g. http://localhost:3000/?initialRoute=/builder)
    url = `${process.env.ELECTRON_RENDERER_URL}/core/?defaultRoute=${encodeURIComponent(route)}`
  } else {
    const fileURL = `file://${join(__dirname, '../renderer/index.html')}`
    url = `${fileURL}?defaultRoute=${encodeURIComponent(route)}`
  }
  mainWindow.loadURL(url)
}

autoUpdater.on('download-progress', (progress) => {
  if (mainWindow) {
    mainWindow.setProgressBar(progress.percent / 100)
  }
})

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.setProgressBar(-1)
  }
})
