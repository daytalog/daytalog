import type {
  ProjectType,
  ProjectToUpdate,
  UpdateProjectResult,
  CreateNewProjectResult,
  Response,
  ResponseWithString,
  OpenModalTypes,
  CheckPathsResult,
  ResponseWithClips,
  ActiveLogPathType,
  PathType,
  RemoveClipsParams
} from '@shared/core/shared-types'
import type { CustomSchemaType, LogType, OcfClipType, SoundClipType } from 'daytalog'
import type { TemplateDirectoryFile, PdfType } from '@shared/core/project-types'
import type { IpcRendererEvent } from 'electron'

declare global {
  interface Window {
    mainApi: {
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      getInitialRoute: () => Promise<string>
      showDaytalogWindow: () => void
      getProject: () => Promise<ProjectType>
      getDaytalogs: () => Promise<LogType[]>
      onProjectLoaded: (
        callback: (project: ProjectType) => void
      ) => (event: IpcRendererEvent, project: ProjectType) => void
      offProjectLoaded: (handler: (event: IpcRendererEvent, project: ProjectType) => void) => void
      updateProject: (project: ProjectToUpdate) => Promise<UpdateProjectResult>
      getFolderPath: () => Promise<ResponseWithString>
      updateDaytalog: (
        daytalog: LogType,
        paths: ActiveLogPathType,
        oldDaytalog?: LogType
      ) => Promise<Response>
      deleteDaytalog: (daytalog: LogType) => Promise<Response>
      onDaytalogsLoaded: (
        callback: (daytalogs: LogType[]) => void
      ) => (event: IpcRendererEvent, daytalogs: LogType[]) => void
      offDaytalogsLoaded: (handler: (event: IpcRendererEvent, daytalogs: LogType[]) => void) => void
      checkDefaultPaths: (paths: PathType) => Promise<CheckPathsResult>
      getDefaultClips: (paths: PathType) => Promise<ResponseWithClips>
      getClips: (params: GetClipsParams) => Promise<ResponseWithClipsAndPaths>
      removeClips: (params: RemoveClipsParams) => Promise<ResponseWithClips>
      openSendWindow: (selection?: string[]) => void
      openBuilder: (callback: (event: IpcRendererEvent, id: string | null) => void) => () => void
      openSettings: (callback: () => void) => () => void
      openNewProject: (callback: () => void) => () => void
      exportPdf: (pdf: PdfType, selection?: string[]) => void
    }
    sendApi: {
      fetchInitialData: () => Promise<InitialSendData>
      showWindow: () => void
      closeSendWindow: () => void
      getFileContent: (filePath: string) => Promise<string>
      getMultipleFileContent: (filePaths: string[]) => Promise<Record<string, string>>
      sendEmail: (email: EmailType) => Promise<Response>
    }
    editorApi: {
      fetchInitialData: () => Promise<InitialEditorData>
      showWindow: () => void
      onDirChanged: (callback: (files: TemplateDirectoryFile[]) => void) => void
      onMockdataChanged: (callback: (data: string) => void) => void
      requestReadFile: (file: TemplateDirectoryFile) => void
      onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) => void
      saveNewFile: (file: ChangedFile) => Promise<Response>
      saveFiles: (files: ChangedFile[]) => Promise<Response>
      deleteFile: (file: TemplateDirectoryFile) => Promise<Response>
    }
    onboardingApi: {
      finishOnboarding: () => void
    }
    externalApi: {
      openExternal: (url: string) => void
    }
    emailConfigApi: {
      checkEmailApiConfigExists: () => Promise<boolean>
      removeEmailApiConfig: () => Promise<Response>
    }
    base64Api: {
      readBase64Files: (base: string, paths: string[]) => Promise<Record<string, string>>
    }
    clipboardApi: {
      readText: () => string
      writeText: (t: string) => void
    }
    errorapi: {
      getErrorMessage: () => Promise<string>
      onErrorMessageUpdated: (
        callback: (message: string) => void
      ) => (event: IpcRendererEvent, message: string) => void
      offErrorMessageUpdated: (handler: (event: IpcRendererEvent, message: string) => void) => void
    }
  }
}
