import { contextBridge, ipcRenderer } from 'electron'

export function exposeExternal() {
  contextBridge.exposeInMainWorld('externalApi', {
    openExternal: (url: string) => ipcRenderer.send('open-link', url)
  })
}

export function exposeEmailApiConfig() {
  contextBridge.exposeInMainWorld('emailConfigApi', {
    checkEmailApiConfigExists: (): Promise<boolean> => ipcRenderer.invoke('check-emailApiConfig'),
    removeEmailApiConfig: (): Promise<Response> => ipcRenderer.invoke('remove-emailApiConfig')
  })
}

export function exposeReadBase64() {
  contextBridge.exposeInMainWorld('base64Api', {
    readBase64Files: (base: string, paths: string[]) =>
      ipcRenderer.invoke('read-files-base64', base, paths)
  })
}

export function exposeSponsorMessage() {
  contextBridge.exposeInMainWorld('sponsorApi', {
    handleSponsoredMessage: (isOnline: boolean, hasMessage: boolean) =>
      ipcRenderer.invoke('handle-sponsored-message', isOnline, hasMessage),
    recordMessageClick: (isOnline: boolean) => ipcRenderer.send('recordMessageClick', isOnline)
  })
}