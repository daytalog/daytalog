import { contextBridge, ipcRenderer } from 'electron'
import { InitialSendData, Response } from '@shared/core/shared-types'
import { safeInvoke } from '@shared/core/utils/ipcUtils'
import { EmailType } from 'daytalog'
import {
  exposeEmailApiConfig,
  exposeExternal,
  exposeReadBase64,
  exposeSponsorMessage
} from './apis/shared'

const sendApi = {
  fetchInitialData: (): Promise<InitialSendData> =>
    safeInvoke<InitialSendData>('initial-send-data'),
  showWindow: (): void => {
    ipcRenderer.send('show-send-window')
  },
  closeSendWindow: () => ipcRenderer.send('close-send-window'),
  getFileContent: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('get-file-content', filePath),
  getMultipleFileContent: (filePaths: string[]): Promise<Record<string, string>> =>
    ipcRenderer.invoke('get-multiple-file-contents', filePaths),
  sendEmail: (email: EmailType): Promise<Response> =>
    safeInvoke<Response>('incoming-send-email-request', email)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('sendApi', sendApi)
    exposeSponsorMessage()
    exposeExternal()
    exposeReadBase64()
    exposeEmailApiConfig()
  } catch (error) {
    console.error(error)
  }
}
