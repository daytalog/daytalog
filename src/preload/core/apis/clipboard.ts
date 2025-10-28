import { contextBridge, clipboard } from 'electron'

// Requires sandbox=false  - https://www.electronjs.org/docs/latest/api/clipboard
export function exposeElectronClipboard() {
  contextBridge.exposeInMainWorld('clipboardApi', {
    readText: () => clipboard.readText(),
    writeText: (t: string) => clipboard.writeText(t)
  })
}
