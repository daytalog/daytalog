import { ipcMain } from 'electron'

let currentErrorMessage: string = ''

export function setupErrorIpcHandlers(): void {
  ipcMain.handle('get-error-message', (): string => {
    return currentErrorMessage
  })

  // Store error message when window is created
  ipcMain.on('set-error-message', (_, message: string) => {
    currentErrorMessage = message
  })
}

export function setErrorMessage(message: string): void {
  currentErrorMessage = message
}
