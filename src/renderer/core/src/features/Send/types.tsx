import { emailZodObj, pdfZodObj } from 'daytalog'
import * as z from 'zod'

export const emailWithAttatchmentsZod = emailZodObj
  .omit({ attachments: true })
  .extend({ attachments: z.array(pdfZodObj).optional() })

export type emailWithAttatchmentsType = z.infer<typeof emailWithAttatchmentsZod>

export const EmailFormZod = emailZodObj.omit({ enabled: true, id: true, label: true })

export type EmailFormType = z.infer<typeof EmailFormZod>
