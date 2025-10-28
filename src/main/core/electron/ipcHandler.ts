import { ipcMain, shell } from 'electron'

export function setupElectronIpcHandlers(): void {
  ipcMain.on('open-link', (_, url: string) => shell.openExternal(url))
}
