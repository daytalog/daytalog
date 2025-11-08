import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '@resources/appIconlight.png?asset'

let onboardWindow: BrowserWindow | null = null

export function openOnboardWindow(): void {
  if (onboardWindow) {
    onboardWindow.focus()
    return
  }

  onboardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    modal: true,
    show: false,
    backgroundColor: 'rgb(9,9,11)',
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/onboarding-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    onboardWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/core/onboarding.html`)
  } else {
    onboardWindow.loadFile(join(__dirname, '../renderer/core/onboarding.html'))
  }

  onboardWindow.once('ready-to-show', () => {
    onboardWindow && onboardWindow.show()
  })

  onboardWindow.on('closed', () => {
    onboardWindow = null
  })
}

export function closeOnboardWindow(): void {
  if (onboardWindow) {
    onboardWindow.close()
    onboardWindow = null
  }
}
