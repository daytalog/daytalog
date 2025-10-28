import z from 'zod'
import { GlobalSchemaZod, ProjectSchemaZod } from 'daytalog'
import { activeLogZod } from './shared-types'

export const emailProvidersZod = z.enum(['custom', 'postmark', 'resend', 'sendgrid'])

const disallowedRegex =
  /^(?!(host|content-length|connection|transfer-encoding|upgrade|content-type)$).+/i

const headersZod = z.object({
  header: z
    .string()
    .nonempty({ message: 'Header key is required.' })
    .regex(disallowedRegex, { message: 'This header is not allowed.' }),
  value: z.string().nonempty({ message: 'a value is required.' })
})

const customEndpoint = z.object({
  provider: emailProvidersZod.extract(['custom']),
  url: z.string().url(),
  headers: z.array(headersZod)
})

const postmarkZod = z.object({
  provider: emailProvidersZod.extract(['postmark']),
  api_key: z.string()
})

const resendZod = z.object({
  provider: emailProvidersZod.extract(['resend']),
  api_key: z.string()
})
const sendgridZod = z.object({
  provider: emailProvidersZod.extract(['sendgrid']),
  url: z.string().url(),
  api_key: z.string()
})

export const emailApiZodObj = z.discriminatedUnion('provider', [
  customEndpoint,
  postmarkZod,
  resendZod,
  sendgridZod
])
export type emailApiType = z.infer<typeof emailApiZodObj>

const ProjectSettingsZod = z.object({
  project: ProjectSchemaZod,
  global: GlobalSchemaZod.optional()
})

const TemplateDirectoryFileZod = z.object({
  path: z.string(),
  name: z.string(),
  type: z.enum(['email', 'pdf']),
  scope: z.enum(['project', 'global'])
})

export const ProjectRootZod = z
  .object({
    settings: ProjectSettingsZod,
    templatesDir: z.array(TemplateDirectoryFileZod),
    activeLog: activeLogZod.nullable(),
    email_sender: z.string().optional(),
    ...ProjectSchemaZod.shape
  })

  .refine(
    (data) => {
      // Check if logid_template is defined in either project or global settings
      const projectFolderTemplate = data.settings.project.logid_template
      const globalFolderTemplate = data.settings.global?.logid_template

      // Ensure that logid_template exists in at least one of them
      return !!projectFolderTemplate || !!globalFolderTemplate
    },
    {
      message: 'logid_template must be present in either project or global settings'
    }
  )
  .transform((data) => {
    // Safely return a version of data with logid_template as a required string
    const logid_template =
      data.settings.project.logid_template || data.settings.global?.logid_template

    // TypeScript check to ensure logid_template is not undefined
    if (!logid_template) {
      throw new Error('logid_template is required but was not found.')
    }

    // Return the complete object with logid_template included
    return {
      ...data,
      logid_template
    }
  })

export const GlobalSchemaZodNullable = GlobalSchemaZod.nullable()

export type TemplateDirectoryFile = z.infer<typeof TemplateDirectoryFileZod>
export type ProjectRootType = z.infer<typeof ProjectRootZod>
export type ProjectSettingsType = z.infer<typeof ProjectSettingsZod>

export type ProjectType = ProjectRootType | null

export type ProjectMenuItem = {
  label: string
  path: string
  active: boolean
}

export type ProjectToUpdate = {
  update_settings: ProjectSettingsType
  update_email_api: emailApiType | null
}

export type UpdateProjectResult = {
  success: boolean
  error?: string
  project?: ProjectType
}

export type CreateNewProjectResult = {
  success: boolean
  error?: string
  project?: ProjectType
}
