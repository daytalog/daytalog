import * as z from 'zod'
import { ProjectSchemaZod, GlobalSchemaZod } from 'daytalog'
import { emailApiZodObj } from '@shared/core/project-types'

export type Scope = 'project' | 'global'

export interface TabProps {
  scope: Scope
}

export const formSchema = z
  .object({
    project_project_name: ProjectSchemaZod.shape.project_name,
    project_logid_template: ProjectSchemaZod.shape.logid_template,
    project_unit: ProjectSchemaZod.shape.unit,
    project_default_ocf_paths: ProjectSchemaZod.shape.default_ocf_paths,
    project_default_sound_paths: ProjectSchemaZod.shape.default_sound_paths,
    project_default_proxy_path: ProjectSchemaZod.shape.default_proxy_path,
    project_custom_schemas: z.any(),
    project_emails: ProjectSchemaZod.shape.emails,
    project_pdfs: ProjectSchemaZod.shape.pdfs,
    global_logid_template: GlobalSchemaZod.shape.logid_template,
    global_unit: GlobalSchemaZod.shape.unit,
    global_default_ocf_paths: GlobalSchemaZod.shape.default_ocf_paths,
    global_default_sound_paths: GlobalSchemaZod.shape.default_sound_paths,
    global_default_proxy_path: GlobalSchemaZod.shape.default_proxy_path,
    global_custom_schemas: z.any(),
    global_emails: GlobalSchemaZod.shape.emails,
    global_email_sender: GlobalSchemaZod.shape.email_sender,
    global_pdfs: GlobalSchemaZod.shape.pdfs,
    new_email_api: emailApiZodObj.optional(),
    email_api_exist: z.boolean()
  })
  .superRefine((data, ctx) => {
    const projectEmpty = data.project_logid_template?.trim() === ''
    const globalEmpty = data.global_logid_template?.trim() === ''
    if (projectEmpty && globalEmpty) {
      ctx.addIssue({
        code: 'custom',
        message: 'Default Log name must be set within the project or shared scope.',
        path: ['project_logid_template']
      })
      ctx.addIssue({
        code: 'custom',
        message: 'Default Log name must be set within the project or shared scope.',
        path: ['global_logid_template']
      })
    }
  })
export type formSchemaType = z.infer<typeof formSchema>
