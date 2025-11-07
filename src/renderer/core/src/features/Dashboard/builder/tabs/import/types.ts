import type { CustomSchemaType } from 'daytalog'

export type HandleAddClipsParams =
  | { type: 'custom'; schema: CustomSchemaType }
  | { type: 'ocf' | 'sound' | 'proxy'; refreshPath?: string }
