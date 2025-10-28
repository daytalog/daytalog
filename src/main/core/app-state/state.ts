import { app, BrowserWindow } from 'electron'
import path from 'path'
import crypto from 'crypto'
import type { state } from './types'
import { ProjectRootType, ProjectMenuItem, ProjectType } from '@shared/core/project-types'
import type { LogType, EmailType } from 'daytalog'

const daytalogStore = new Map<string, LogType>()
export const sendWindowDataMap = new Map<
  number,
  {
    window: BrowserWindow
    selectedEmail: EmailType | null
    selection?: string[]
  }
>()

export const daytalogs = (): Map<string, LogType> => daytalogStore

class AppState {
  private static instance: AppState
  private _projectsInRootPath: ProjectMenuItem[] | null = null
  private _config: state = { activeProject: null, activeLog: null }
  private _activeProjectData: ProjectRootType | null = null
  private readonly _appPath: string = app.getPath('userData')
  private readonly _folderPath: string = path.join(app.getPath('documents'), 'Daytalog')
  private readonly _localsharedPath: string = path.join(this._folderPath, 'LocalShared')
  private readonly _projectsPath: string = path.join(this._folderPath, 'Projects')
  private readonly _sessionId: string = crypto.randomUUID()

  private constructor() {}

  public static getInstance() {
    if (!AppState.instance) {
      AppState.instance = new AppState()
    }
    return AppState.instance
  }

  get projectsInRootPath(): ProjectMenuItem[] | null {
    return this._projectsInRootPath
  }
  set projectsInRootPath(projects: ProjectMenuItem[] | null) {
    this._projectsInRootPath = projects
  }

  get config(): state {
    return this._config
  }

  set config(data: state) {
    this._config = data
  }

  get project(): ProjectType {
    return this._activeProjectData
  }
  set project(project: ProjectType) {
    this._activeProjectData = project
  }

  get appPath(): string {
    return this._appPath
  }

  get folderPath(): string {
    return this._folderPath
  }

  get localSharedPath(): string {
    return this._localsharedPath
  }

  get projectsPath(): string {
    return this._projectsPath
  }
  get sessionId(): string {
    return this._sessionId
  }
}

export const appState = AppState.getInstance()
