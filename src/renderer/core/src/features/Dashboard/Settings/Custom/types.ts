import { CameraMetadataEnumZod, CustomSchemaType } from 'daytalog'

import * as z from 'zod'

export type SchemaEditType = {
  index: number
  schema: CustomSchemaType
}

//export const SchemaFormZod = CustomSchemaZod.omit({ order: true, active: true })
//export type SchemaFormType = z.infer<typeof SchemaFormZod>

const BasicKeyName = z
  .string()
  .nonempty({ message: 'Key name is required.' })
  .max(100, { message: 'Key name must be less than 100 characters.' })
  .regex(/^[a-zA-Z0-9_]+$/, 'Key name can only contain letters, numbers, and underscores')
  .refine((val) => !CameraMetadataEnumZod.options.includes(val as any), {
    error: `Key name cannot be a reserved metadata type. Use the type dropdown to select this type instead.`
  })

// Define the field types that match what the form actually uses
const FieldZod = z.union([
  // Basic field types with key_name
  z.object({
    type: z.literal('text'),
    key_name: BasicKeyName,
    column: z.string().optional()
  }),
  z.object({
    type: z.literal('text_list'),
    key_name: BasicKeyName,
    column: z.string().optional(),
    delimiter: z.enum([',', ';', '|', ':', '=']).optional()
  }),
  z.object({
    type: z.literal('text_list_list'),
    key_name: BasicKeyName,
    column: z.string().optional(),
    primary_delimiter: z.enum([',', ';', '|', ':', '=']).optional(),
    secondary_delimiter: z.enum([',', ';', '|', ':', '=']).optional()
  }),
  z.object({
    type: z.literal('kv_map'),
    key_name: BasicKeyName,
    column: z.string().optional(),
    primary_delimiter: z.enum([',', ';', '|', ':', '=']).optional(),
    secondary_delimiter: z.enum([',', ';', '|', ':', '=']).optional()
  }),
  z.object({
    type: z.literal('kv_map_list'),
    key_name: BasicKeyName,
    column: z.string().optional(),
    subfields: z.array(
      z.object({ key_name: z.string().nonempty({ message: 'Key name is required.' }) })
    ),
    primary_delimiter: z.enum([',', ';', '|', ':', '=']).optional(),
    secondary_delimiter: z.enum([',', ';', '|', ':', '=']).optional()
  }),
  // Camera metadata fields (no key_name) - use a more flexible approach
  z.object({
    type: CameraMetadataEnumZod,
    column: z.string().optional()
  })
])

export const SchemaFormZod = z
  .object({
    id: z.string().min(1, 'Schema name is required'),
    sync: z.enum(['clip', 'tc']),
    csv_import: z.boolean(),
    clip_col: z.string(),
    tc_start_col: z.string(),
    tc_end_col: z.string(),
    log_fields: z.array(FieldZod).optional(),
    clip_fields: z.array(FieldZod).optional()
  })
  .superRefine((data, ctx) => {
    if (data.csv_import) {
      if (data.clip_fields?.length) {
        if (data.sync === 'clip' && (!data.clip_col || data.clip_col.trim() === '')) {
          ctx.addIssue({ code: 'custom', message: 'Clip column is required', path: ['clip_col'] })
        }
        if (data.sync === 'tc' && (!data.tc_start_col || data.tc_start_col.trim() === '')) {
          ctx.addIssue({
            code: 'custom',
            message: 'TC start column is required',
            path: ['tc_start_col']
          })
        }
        if (data.sync === 'tc' && (!data.tc_end_col || data.tc_end_col.trim() === '')) {
          ctx.addIssue({
            code: 'custom',
            message: 'TC end column is required',
            path: ['tc_end_col']
          })
        }
      }
      data.clip_fields?.forEach((field, index) => {
        if (!field.column || field.column.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Column is required',
            path: [`clip_fields[${index}].column`]
          })
        }
      })
      data.log_fields?.forEach((field, index) => {
        if (!field.column || field.column.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Column is required',
            path: [`log_fields[${index}].column`]
          })
        }
      })
    }
  })

export type FieldType = z.infer<typeof FieldZod>
export type SchemaFormType = z.infer<typeof SchemaFormZod>
