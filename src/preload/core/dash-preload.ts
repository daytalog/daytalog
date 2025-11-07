import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type { LogType, PdfType, OcfClipType, SoundClipType } from 'daytalog'
import type { ProjectType } from '@shared/core/project-types'
import type { ActiveLogPathType, GetClipsParams, PathType } from '@shared/core/shared-types'
import { exposeEmailApiConfig, exposeExternal, exposeSponsorMessage } from './apis/shared'
import { exposeElectronClipboard } from './apis/clipboard'

// Custom APIs for renderer
const mainApi = {
  getInitialRoute: () => ipcRenderer.invoke('get-route'),
  showDaytalogWindow: (): void => ipcRenderer.send('show-daytalog'),
  getProject: () => ipcRenderer.invoke('get-project'),
  getDaytalogs: () => ipcRenderer.invoke('get-daytalogs'),

  //load project
  onProjectLoaded: (callback: (project: ProjectType) => void) => {
    const handler = (_event, project: ProjectType) => callback(project)
    ipcRenderer.on('project-loaded', handler)
    return handler
  },
  offProjectLoaded: (handler: (event: Electron.IpcRendererEvent, project: ProjectType) => void) => {
    ipcRenderer.removeListener('project-loaded', handler)
  },
  createNewProject: (projectName: string) => ipcRenderer.invoke('create-new-project', projectName),
  updateProject: (project) => ipcRenderer.invoke('update-project', project),
  getFolderPath: () => ipcRenderer.invoke('getFolderPath'),
  updateDaytalog: (daytalog: LogType, paths: ActiveLogPathType, oldDaytalog?: LogType) =>
    ipcRenderer.invoke('update-daytalog', daytalog, paths, oldDaytalog),
  deleteDaytalog: (daytalog: LogType) => ipcRenderer.invoke('delete-daytalog', daytalog),

  // load daytalogs
  onDaytalogsLoaded: (callback: (daytalogs: LogType[]) => void) => {
    const handler = (_event, daytalogs: LogType[]) => callback(daytalogs)
    ipcRenderer.on('daytalogs-loaded', handler)
    return handler
  },
  offDaytalogsLoaded: (
    handler: (event: Electron.IpcRendererEvent, daytalogs: LogType[]) => void
  ) => {
    ipcRenderer.removeListener('daytalogs-loaded', handler)
  },
  checkDefaultPaths: (paths: PathType) => ipcRenderer.invoke('checkPaths', paths),
  getDefaultClips: (paths: PathType) => ipcRenderer.invoke('getDefaultClips', paths),
  getClips: (params: GetClipsParams) => ipcRenderer.invoke('getClips', params),
  removeClips: (
    paths: string[],
    type: 'ocf' | 'sound',
    storedClips: OcfClipType[] | SoundClipType[]
  ) => ipcRenderer.invoke('removeClips', paths, type, storedClips),
  openSendWindow: (selection?: string[]) => ipcRenderer.send('open-send-window', selection),

  openBuilder: (callback: (event: IpcRendererEvent, id: string | null) => void) => {
    ipcRenderer.on('open-builder', callback)
    return () => ipcRenderer.removeListener('open-builder', callback)
  },
  openSettings: (callback: () => void) => {
    ipcRenderer.on('open-settings', callback)
    return () => ipcRenderer.removeListener('open-settings', callback)
  },
  openNewProject: (callback: () => void) => {
    ipcRenderer.on('open-new-project', callback)
    return () => ipcRenderer.removeListener('open-new-project', callback)
  },

  exportPdf: (pdf: PdfType, selection?: string[]) =>
    ipcRenderer.send('pdf-to-export', pdf, selection)
}

function initPreload() {
  if (!process.contextIsolated) return
  try {
    contextBridge.exposeInMainWorld('mainApi', mainApi)
    exposeElectronClipboard()
    exposeEmailApiConfig()
    exposeSponsorMessage()
    exposeExternal()
  } catch (error) {
    console.error(error)
  }
}

initPreload()
