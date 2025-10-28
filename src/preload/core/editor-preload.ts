import { contextBridge, ipcRenderer } from 'electron'
import { TemplateDirectoryFile } from '@shared/core/project-types'
import { safeInvoke } from '@shared/core/utils/ipcUtils'
import { LoadedFile, InitialEditorData, ChangedFile } from '@shared/core/shared-types'
import { exposeExternal, exposeReadBase64 } from './apis/shared'

const editorApi = {
  fetchInitialData: (): Promise<InitialEditorData> =>
    safeInvoke<InitialEditorData>('initial-editor-data'),
  showWindow: (): void => {
    ipcRenderer.send('show-editor-window')
  },
  onDirChanged: (callback: (files: TemplateDirectoryFile[]) => void) => {
    const handler = (_: Electron.IpcRendererEvent, files: TemplateDirectoryFile[]) =>
      callback(files)
    ipcRenderer.on('directory-changed', handler)
    return () => ipcRenderer.removeListener('directory-changed', handler)
  },
  onMockdataChanged: (callback: (data: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: string) => callback(data)
    ipcRenderer.on('mockdata-changed', handler)
    return () => ipcRenderer.removeListener('mockdata-changed', handler)
  },
  requestReadFile: (file: TemplateDirectoryFile) => ipcRenderer.send('request-read-file', file),
  onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) => {
    const handler = (_: Electron.IpcRendererEvent, file: LoadedFile | { error: string }) =>
      callback(file)
    ipcRenderer.on('response-read-file', handler)
    return () => ipcRenderer.removeListener('response-read-file', handler)
  },
  saveNewFile: (file: ChangedFile) => ipcRenderer.invoke('save-new-file', file),
  saveFiles: (files: ChangedFile[]) => safeInvoke('save-files', files),
  deleteFile: (file: TemplateDirectoryFile) => ipcRenderer.invoke('delete-file', file)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('editorApi', editorApi)
    exposeReadBase64()
    exposeExternal()
  } catch (error) {
    console.error(error)
  }
}
