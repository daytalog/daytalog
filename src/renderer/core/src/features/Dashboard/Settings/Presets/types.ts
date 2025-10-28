import * as z from 'zod'
import { pdfZodObj, emailZodObj, PdfType, EmailType } from 'daytalog'

export type pdfEditType = {
  index: number
  pdf: PdfType
}
export type emailEditType = {
  index: number
  email: EmailType
}

export const pdfWithoutIDZod = pdfZodObj.omit({ id: true, enabled: true })
export type pdfWitoutIDType = z.infer<typeof pdfWithoutIDZod>

export const emailWithoutIDZod = emailZodObj.omit({ id: true, enabled: true })
export type emailWithoutIDType = z.infer<typeof emailWithoutIDZod>
