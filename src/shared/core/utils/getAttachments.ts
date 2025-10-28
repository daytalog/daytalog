import type { PdfType } from 'daytalog'

export function getPdfAttachments(
  pdfs: PdfType[],
  attachments: string[],
  getNamesOnly: true
): string[]

export function getPdfAttachments(
  pdfs: PdfType[],
  attachments: string[],
  getNamesOnly?: false
): PdfType[]

export function getPdfAttachments(
  pdfs: PdfType[],
  attachments: string[],
  getNamesOnly = false
): (PdfType | string)[] {
  // Match the attachment IDs to PDF objects
  const matchedPdfs = attachments
    .map((attachmentId) => pdfs.find((pdf) => pdf.id === attachmentId))
    .filter(Boolean) as PdfType[]

  // Return either the PDF objects or their names
  return getNamesOnly ? matchedPdfs.map((pdf) => pdf.id) : matchedPdfs
}
