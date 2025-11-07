import { TemplateDirectoryFile, ProjectRootType } from './project-types'
import type {
  EmailType,
  LogType,
  OcfClipType,
  SoundClipType,
  ProxyClipType,
  CustomType,
  CustomSchemaType
} from 'daytalog'
import * as z from 'zod'

export type DurationType = {
  hours: number
  minutes: number
  seconds: number
}

export type FileInfo = {
  filename: string
  size: number
}
export type OfflineFolderType = {
  folderPath: string
  folderSize: number
  files: FileInfo[]
}

export type saveEntryResult = {
  success: boolean
  message?: string
}

export type Path = {
  project: string
  global: string
}

export type LoadedFile = TemplateDirectoryFile & {
  content: string
  filetype: 'jsx' | 'tsx'
}

export type ChangedFile = {
  path: string
  content: string
}

export type InitialDir = {
  dir: TemplateDirectoryFile[]
  path: Path
}

export type Response = { success: true } | { success: false; error: string; cancelled?: boolean }

export type ResponseWithString =
  | { success: true; data: string }
  | { success: false; error: string; cancelled?: boolean }

export type ResponseWithClips =
  | {
      success: true
      clips: {
        ocf?: OcfClipType[]
        sound?: SoundClipType[]
        proxy?: ProxyClipType[]
        custom?: CustomType
      }
    }
  | { success: false; error: string; cancelled?: boolean }

export type ResponseWithClipsAndPaths =
  | {
      success: true
      clips: {
        ocf?: OcfClipType[]
        sound?: SoundClipType[]
        proxy?: ProxyClipType[]
        custom?: CustomType
      }
      paths: ActiveLogPathType
    }
  | { success: false; error: string; cancelled?: boolean }

export type GetClipsParams = {
  type: 'ocf' | 'sound' | 'proxy' | 'custom'
  storedClips: OcfClipType[] | SoundClipType[]
  customSchema: CustomSchemaType | null
  refreshPath: string | null
}

export type RemoveClipsParams = {
  paths: string[]
  type: 'ocf' | 'sound'
  storedClips: OcfClipType[] | SoundClipType[]
}

export type OpenModalTypes = 'new-project' | 'new-shooting-day' | 'project-settings'

export type InitialEditorData = {
  paths: {
    localshared: string
    project: string
  }
  project: ProjectRootType
  loadedDaytalogs: LogType[]
}

export type InitialSendData = {
  selectedEmail: EmailType | null
  project: ProjectRootType
  selection?: string[]
  logs: LogType[]
}

export interface DefaultPathsInput {
  ocf: string[] | null
  sound: string[] | null
  proxy: string | null
}

export interface CheckResult {
  path: string
  available: boolean
}

export interface CheckPathsResult {
  ocf: CheckResult[] | null
  sound: CheckResult[] | null
  proxy: CheckResult[] | null
}

const LogPathZod = z.object({
  ocf: z.array(z.string()).nullable(),
  sound: z.array(z.string()).nullable(),
  proxy: z.array(z.string()).nullable()
})

const activeLogPathZod = LogPathZod.nullable()

export const activeLogZod = z.object({
  id: z.string(),
  paths: activeLogPathZod
})
export type PathType = z.infer<typeof LogPathZod>
export type ActiveLogPathType = z.infer<typeof activeLogPathZod>
export type ActiveLogType = z.infer<typeof activeLogZod>
