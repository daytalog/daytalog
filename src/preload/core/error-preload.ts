import { contextBridge, ipcRenderer } from 'electron'

// Error API for error window
const errorApi = {
  getErrorMessage: () => ipcRenderer.invoke('get-error-message'),
  onErrorMessageUpdated: (callback: (message: string) => void) => {
    const handler = (_event, message: string) => callback(message)
    ipcRenderer.on('error-message-updated', handler)
    return handler
  },
  offErrorMessageUpdated: (
    handler: (event: Electron.IpcRendererEvent, message: string) => void
  ) => {
    ipcRenderer.removeListener('error-message-updated', handler)
  }
}

function initErrorPreload() {
  if (!process.contextIsolated) return
  try {
    contextBridge.exposeInMainWorld('errorapi', errorApi)
  } catch (error) {
    console.error('Failed to expose error API:', error)
  }
}

initErrorPreload()
