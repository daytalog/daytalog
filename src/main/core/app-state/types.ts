import * as z from 'zod'
import { activeLogZod } from '@shared/core/shared-types'

export const stateZod = z.object({
  activeProject: z.string().nullable(),
  activeLog: activeLogZod.nullable()
})

export type state = z.infer<typeof stateZod>

export interface error {
  error: boolean
  message: string
}
