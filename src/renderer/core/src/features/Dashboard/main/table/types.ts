import type { LogType } from 'daytalog'
export interface LogSum {
  id: string
  day: number
  date: string
  unit: string
  ocfClips: number
  ocfSize: number
  ocfCopies: string
  ocfDuration: string
  proxyClips: number
  proxySize: number
  soundClips: number
  soundSize: number
  soundCopies: string
  reels: string[]
  raw: LogType
}
